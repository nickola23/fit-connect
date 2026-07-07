using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.Cooperations;
using FitConnect.Domain.Cooperations;
using FitConnect.Domain.Exceptions;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public class PricingTierRepository : IPricingTierRepository
{
    private readonly IDbConnectionFactory connectionFactory;

    public PricingTierRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<PricingTier?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "SELECT id, trainer_id, sessions_per_week, monthly_price, active FROM pricing_tiers WHERE id = @id";

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    public async Task<IReadOnlyList<PricingTier>> GetForTrainerAsync(Guid trainerId, bool activeOnly, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var sql = "SELECT id, trainer_id, sessions_per_week, monthly_price, active FROM pricing_tiers WHERE trainer_id = @trainerId";
        if (activeOnly)
        {
            sql += " AND active = TRUE";
        }
        sql += " ORDER BY sessions_per_week";

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("trainerId", trainerId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var tiers = new List<PricingTier>();
        while (await reader.ReadAsync(cancellationToken))
        {
            tiers.Add(Map(reader));
        }

        return tiers;
    }

    public async Task<PricingTier> CreateAsync(PricingTier pricingTier, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            INSERT INTO pricing_tiers (id, trainer_id, sessions_per_week, monthly_price, active)
            VALUES (@id, @trainerId, @sessionsPerWeek, @monthlyPrice, @active)
            """;

        await using var command = CreateCommand(connection, sql);
        AddParameters(command, pricingTier);

        try
        {
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new DuplicatePricingTierException(pricingTier.TrainerId, pricingTier.SessionsPerWeek);
        }

        return pricingTier;
    }

    public async Task UpdateAsync(PricingTier pricingTier, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "UPDATE pricing_tiers SET monthly_price = @monthlyPrice, active = @active WHERE id = @id";

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", pricingTier.Id);
        command.Parameters.AddWithValue("monthlyPrice", pricingTier.MonthlyPrice);
        command.Parameters.AddWithValue("active", pricingTier.Active);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static void AddParameters(NpgsqlCommand command, PricingTier tier)
    {
        command.Parameters.AddWithValue("id", tier.Id);
        command.Parameters.AddWithValue("trainerId", tier.TrainerId);
        command.Parameters.AddWithValue("sessionsPerWeek", (short)tier.SessionsPerWeek);
        command.Parameters.AddWithValue("monthlyPrice", tier.MonthlyPrice);
        command.Parameters.AddWithValue("active", tier.Active);
    }

    private static NpgsqlCommand CreateCommand(DbConnection connection, string sql)
    {
        var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        return command;
    }

    private static PricingTier Map(DbDataReader reader) => new(
        reader.GetGuid(reader.GetOrdinal("id")),
        reader.GetGuid(reader.GetOrdinal("trainer_id")),
        reader.GetInt16(reader.GetOrdinal("sessions_per_week")),
        reader.GetDecimal(reader.GetOrdinal("monthly_price")),
        reader.GetBoolean(reader.GetOrdinal("active")));
}