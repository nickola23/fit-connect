using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.Users;
using FitConnect.Domain.Users;

namespace FitConnect.Infrastructure.Repositories;

public class AdminRepository : UserRepositoryBase, IAdminRepository
{
    public AdminRepository(IDbConnectionFactory connectionFactory) : base(connectionFactory)
    {
    }

    public async Task<Admin?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT u.id, u.name, u.email, u.password_hash, u.language, u.created_at
            FROM users u
            INNER JOIN admins a ON a.user_id = u.id
            WHERE u.id = @id
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? MapAdmin(reader) : null;
    }

    public async Task<IReadOnlyList<Admin>> GetAllAsync(CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT u.id, u.name, u.email, u.password_hash, u.language, u.created_at
            FROM users u
            INNER JOIN admins a ON a.user_id = u.id
            ORDER BY u.name
            """;

        await using var command = CreateCommand(connection, sql);
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);

        var admins = new List<Admin>();
        while (await reader.ReadAsync(cancellationToken))
        {
            admins.Add(MapAdmin(reader));
        }

        return admins;
    }

    public async Task<Admin> CreateAsync(Admin admin, CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await InsertUserAsync(connection, transaction, admin, "ADMIN", cancellationToken);

        const string insertAdminSql = "INSERT INTO admins (user_id) VALUES (@id)";
        await using (var command = CreateCommand(connection, insertAdminSql, transaction))
        {
            command.Parameters.AddWithValue("id", admin.Id);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
        return admin;
    }

    public async Task UpdateAsync(Admin admin, CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await UpdateUserCoreAsync(connection, admin.Id, admin.Name, admin.Language, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await DeleteUserAsync(connection, id, cancellationToken);
    }

    public async Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);
        return await CheckEmailExistsAsync(connection, email, cancellationToken);
    }

    private static Admin MapAdmin(DbDataReader reader)
    {
        var (id, name, email, passwordHash, language, createdAt) = ReadUserColumns(reader);
        return new Admin(id, name, email, passwordHash, language, createdAt);
    }
}