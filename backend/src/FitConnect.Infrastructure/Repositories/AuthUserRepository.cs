using FitConnect.Application.Auth;
using FitConnect.Application.Common;
using FitConnect.Domain.Enums;

namespace FitConnect.Infrastructure.Repositories;

public class AuthUserRepository : IAuthUserRepository
{
    private readonly IDbConnectionFactory connectionFactory;

    public AuthUserRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<AuthUserRecord?> FindByEmailAsync(string email, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "SELECT id, name, email, password_hash, role FROM users WHERE email = @email";

        await using var command = (Npgsql.NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.AddWithValue("email", email);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        var role = Enum.Parse<UserRole>(reader.GetString(reader.GetOrdinal("role")), ignoreCase: true);

        return new AuthUserRecord(
            reader.GetGuid(reader.GetOrdinal("id")),
            reader.GetString(reader.GetOrdinal("name")),
            reader.GetString(reader.GetOrdinal("email")),
            reader.GetString(reader.GetOrdinal("password_hash")),
            role);
    }
}