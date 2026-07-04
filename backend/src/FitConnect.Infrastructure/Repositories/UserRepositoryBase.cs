using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Domain.Users;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public abstract class UserRepositoryBase
{
    protected readonly IDbConnectionFactory ConnectionFactory;

    protected UserRepositoryBase(IDbConnectionFactory connectionFactory)
    {
        ConnectionFactory = connectionFactory;
    }

    protected static NpgsqlCommand CreateCommand(DbConnection connection, string sql, DbTransaction? transaction = null)
    {
        var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        command.Transaction = (NpgsqlTransaction?)transaction;
        return command;
    }

    protected async Task<bool> CheckEmailExistsAsync(DbConnection connection, string email, CancellationToken cancellationToken)
    {
        const string sql = "SELECT EXISTS(SELECT 1 FROM users WHERE email = @email)";
        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("email", email);
        return (bool)(await command.ExecuteScalarAsync(cancellationToken))!;
    }

    protected async Task InsertUserAsync(DbConnection connection, DbTransaction transaction, User user, string role, CancellationToken cancellationToken)
    {
        const string sql = """
            INSERT INTO users (id, name, email, password_hash, language, role, created_at)
            VALUES (@id, @name, @email, @passwordHash, @language, @role::user_role, @createdAt)
            """;

        await using var command = CreateCommand(connection, sql, transaction);
        command.Parameters.AddWithValue("id", user.Id);
        command.Parameters.AddWithValue("name", user.Name);
        command.Parameters.AddWithValue("email", user.Email);
        command.Parameters.AddWithValue("passwordHash", user.PasswordHash);
        command.Parameters.AddWithValue("language", user.Language);
        command.Parameters.AddWithValue("role", role);
        command.Parameters.AddWithValue("createdAt", user.CreatedAt);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    protected async Task UpdateUserCoreAsync(DbConnection connection, Guid id, string name, string language, CancellationToken cancellationToken)
    {
        const string sql = "UPDATE users SET name = @name, language = @language WHERE id = @id";
        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);
        command.Parameters.AddWithValue("name", name);
        command.Parameters.AddWithValue("language", language);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    protected async Task DeleteUserAsync(DbConnection connection, Guid id, CancellationToken cancellationToken)
    {
        const string sql = "DELETE FROM users WHERE id = @id";
        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    protected static (Guid Id, string Name, string Email, string PasswordHash, string Language, DateTimeOffset CreatedAt) ReadUserColumns(DbDataReader reader) =>
        (
            reader.GetGuid(reader.GetOrdinal("id")),
            reader.GetString(reader.GetOrdinal("name")),
            reader.GetString(reader.GetOrdinal("email")),
            reader.GetString(reader.GetOrdinal("password_hash")),
            reader.GetString(reader.GetOrdinal("language")),
            reader.GetFieldValue<DateTimeOffset>(reader.GetOrdinal("created_at"))
        );
}