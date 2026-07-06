using FitConnect.Application.Common;
using FitConnect.Application.Cooperations;
using FitConnect.Domain.Cooperations;
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

        await using var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        return new PricingTier(
            reader.GetGuid(reader.GetOrdinal("id")),
            reader.GetGuid(reader.GetOrdinal("trainer_id")),
            reader.GetInt16(reader.GetOrdinal("sessions_per_week")),
            reader.GetDecimal(reader.GetOrdinal("monthly_price")),
            reader.GetBoolean(reader.GetOrdinal("active")));
    }
}