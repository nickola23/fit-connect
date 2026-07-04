using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.Users;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Users;

namespace FitConnect.Infrastructure.Repositories;

public class ClientRepository : UserRepositoryBase, IClientRepository
{
    public ClientRepository(IDbConnectionFactory connectionFactory) : base(connectionFactory)
    {
    }

    public async Task<Client?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT u.id, u.name, u.email, u.password_hash, u.language, u.created_at,
                   c.goal, c.training_location, c.free_trial_used
            FROM users u
            INNER JOIN clients c ON c.user_id = u.id
            WHERE u.id = @id
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? MapClient(reader) : null;
    }

    public async Task<PagedResult<Client>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string countSql = "SELECT COUNT(*) FROM clients";
        await using var countCommand = CreateCommand(connection, countSql);
        var totalCount = (long)(await countCommand.ExecuteScalarAsync(cancellationToken))!;

        const string sql = """
            SELECT u.id, u.name, u.email, u.password_hash, u.language, u.created_at,
                   c.goal, c.training_location, c.free_trial_used
            FROM users u
            INNER JOIN clients c ON c.user_id = u.id
            ORDER BY u.name
            LIMIT @pageSize OFFSET @offset
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("pageSize", pageSize);
        command.Parameters.AddWithValue("offset", (page - 1) * pageSize);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var clients = new List<Client>();
        while (await reader.ReadAsync(cancellationToken))
        {
            clients.Add(MapClient(reader));
        }

        return new PagedResult<Client> { Items = clients, TotalCount = (int)totalCount, Page = page, PageSize = pageSize };
    }

    public async Task<Client> CreateAsync(Client client, CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await InsertUserAsync(connection, transaction, client, "CLIENT", cancellationToken);

        const string sql = """
            INSERT INTO clients (user_id, goal, training_location, free_trial_used)
            VALUES (@id, @goal, @location::training_location, @freeTrialUsed)
            """;

        await using (var command = CreateCommand(connection, sql, transaction))
        {
            AddClientParameters(command, client);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
        return client;
    }

    public async Task UpdateAsync(Client client, CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await UpdateUserCoreAsync(connection, client.Id, client.Name, client.Language, cancellationToken);

        const string sql = """
            UPDATE clients
            SET goal = @goal, training_location = @location::training_location, free_trial_used = @freeTrialUsed
            WHERE user_id = @id
            """;

        await using (var command = CreateCommand(connection, sql, transaction))
        {
            AddClientParameters(command, client);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
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

    private static void AddClientParameters(Npgsql.NpgsqlCommand command, Client client)
    {
        command.Parameters.AddWithValue("id", client.Id);
        command.Parameters.AddWithValue("goal", (object?)client.Goal ?? DBNull.Value);
        command.Parameters.AddWithValue("location", (object?)client.TrainingLocation?.ToString().ToUpperInvariant() ?? DBNull.Value);
        command.Parameters.AddWithValue("freeTrialUsed", client.FreeTrialUsed);
    }

    private static Client MapClient(DbDataReader reader)
    {
        var (id, name, email, passwordHash, language, createdAt) = ReadUserColumns(reader);
        var goal = reader.IsDBNull(reader.GetOrdinal("goal")) ? null : reader.GetString(reader.GetOrdinal("goal"));
        var locationOrdinal = reader.GetOrdinal("training_location");
        TrainingLocation? location = reader.IsDBNull(locationOrdinal)
            ? null
            : Enum.Parse<TrainingLocation>(reader.GetString(locationOrdinal), ignoreCase: true);
        var freeTrialUsed = reader.GetBoolean(reader.GetOrdinal("free_trial_used"));

        return new Client(id, name, email, passwordHash, language, createdAt, goal, location, freeTrialUsed);
    }
}