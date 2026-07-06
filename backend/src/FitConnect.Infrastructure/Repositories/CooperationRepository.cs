using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.Cooperations;
using FitConnect.Domain.Cooperations;
using FitConnect.Domain.Exceptions;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public class CooperationRepository : ICooperationRepository
{
    private readonly IDbConnectionFactory connectionFactory;

    public CooperationRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<Cooperation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT id, trainer_id, client_id, pricing_tier_id, status, request_date, start_date, end_date, is_free_trial
            FROM cooperations
            WHERE id = @id
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    public async Task<CooperationParticipants?> GetParticipantsAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "SELECT trainer_id, client_id FROM cooperations WHERE id = @id";
        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        return new CooperationParticipants(
            reader.GetGuid(reader.GetOrdinal("trainer_id")),
            reader.GetGuid(reader.GetOrdinal("client_id")));
    }

    public async Task<IReadOnlyList<Cooperation>> GetForClientAsync(Guid clientId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT id, trainer_id, client_id, pricing_tier_id, status, request_date, start_date, end_date, is_free_trial
            FROM cooperations
            WHERE client_id = @clientId
            ORDER BY request_date DESC
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("clientId", clientId);

        return await ReadAllAsync(command, cancellationToken);
    }

    public async Task<IReadOnlyList<Cooperation>> GetForTrainerAsync(Guid trainerId, CooperationStatus? statusFilter = null, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var sql = """
            SELECT id, trainer_id, client_id, pricing_tier_id, status, request_date, start_date, end_date, is_free_trial
            FROM cooperations
            WHERE trainer_id = @trainerId
            """;

        if (statusFilter is not null)
        {
            sql += " AND status = @status::cooperation_status";
        }

        sql += " ORDER BY request_date DESC";

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("trainerId", trainerId);
        if (statusFilter is not null)
        {
            command.Parameters.AddWithValue("status", statusFilter.Value.ToString().ToUpperInvariant());
        }

        return await ReadAllAsync(command, cancellationToken);
    }

    public async Task<bool> HasAcceptedOrActiveCooperationAsync(Guid clientId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT EXISTS(
                SELECT 1 FROM cooperations
                WHERE client_id = @clientId AND status IN ('ACCEPTED', 'ACTIVE')
            )
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("clientId", clientId);
        return (bool)(await command.ExecuteScalarAsync(cancellationToken))!;
    }

    public async Task<Cooperation> CreateAsync(Cooperation cooperation, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            INSERT INTO cooperations (id, trainer_id, client_id, pricing_tier_id, status, request_date, start_date, end_date, is_free_trial)
            VALUES (@id, @trainerId, @clientId, @pricingTierId, @status::cooperation_status, @requestDate, @startDate, @endDate, @isFreeTrial)
            """;

        await using var command = CreateCommand(connection, sql);
        AddParameters(command, cooperation);

        try
        {
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw ex.ConstraintName switch
            {
                "uq_one_active_cooperation_per_client" => new CooperationAlreadyActiveException(cooperation.ClientId),
                "uq_one_free_trial_per_client" => new FreeTrialAlreadyUsedException(cooperation.ClientId),
                _ => new InvalidOperationException("Unexpected unique constraint violation while creating cooperation.", ex)
            };
        }

        return cooperation;
    }

    public async Task UpdateAsync(Cooperation cooperation, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            UPDATE cooperations
            SET status = @status::cooperation_status, start_date = @startDate, end_date = @endDate
            WHERE id = @id
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", cooperation.Id);
        command.Parameters.AddWithValue("status", cooperation.Status.ToString().ToUpperInvariant());
        command.Parameters.AddWithValue("startDate", (object?)cooperation.StartDate ?? DBNull.Value);
        command.Parameters.AddWithValue("endDate", (object?)cooperation.EndDate ?? DBNull.Value);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static async Task<IReadOnlyList<Cooperation>> ReadAllAsync(NpgsqlCommand command, CancellationToken cancellationToken)
    {
        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var results = new List<Cooperation>();
        while (await reader.ReadAsync(cancellationToken))
        {
            results.Add(Map(reader));
        }

        return results;
    }

    private static void AddParameters(NpgsqlCommand command, Cooperation cooperation)
    {
        command.Parameters.AddWithValue("id", cooperation.Id);
        command.Parameters.AddWithValue("trainerId", cooperation.TrainerId);
        command.Parameters.AddWithValue("clientId", cooperation.ClientId);
        command.Parameters.AddWithValue("pricingTierId", (object?)cooperation.PricingTierId ?? DBNull.Value);
        command.Parameters.AddWithValue("status", cooperation.Status.ToString().ToUpperInvariant());
        command.Parameters.AddWithValue("requestDate", cooperation.RequestDate);
        command.Parameters.AddWithValue("startDate", (object?)cooperation.StartDate ?? DBNull.Value);
        command.Parameters.AddWithValue("endDate", (object?)cooperation.EndDate ?? DBNull.Value);
        command.Parameters.AddWithValue("isFreeTrial", cooperation.IsFreeTrial);
    }

    private static NpgsqlCommand CreateCommand(DbConnection connection, string sql)
    {
        var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        return command;
    }

    private static Cooperation Map(DbDataReader reader)
    {
        var status = Enum.Parse<CooperationStatus>(reader.GetString(reader.GetOrdinal("status")), ignoreCase: true);
        var pricingTierOrdinal = reader.GetOrdinal("pricing_tier_id");
        var startDateOrdinal = reader.GetOrdinal("start_date");
        var endDateOrdinal = reader.GetOrdinal("end_date");

        return new Cooperation(
            reader.GetGuid(reader.GetOrdinal("id")),
            reader.GetGuid(reader.GetOrdinal("trainer_id")),
            reader.GetGuid(reader.GetOrdinal("client_id")),
            reader.IsDBNull(pricingTierOrdinal) ? null : reader.GetGuid(pricingTierOrdinal),
            status,
            reader.GetFieldValue<DateTimeOffset>(reader.GetOrdinal("request_date")),
            reader.IsDBNull(startDateOrdinal) ? null : reader.GetFieldValue<DateOnly>(startDateOrdinal),
            reader.IsDBNull(endDateOrdinal) ? null : reader.GetFieldValue<DateOnly>(endDateOrdinal),
            reader.GetBoolean(reader.GetOrdinal("is_free_trial")));
    }
}