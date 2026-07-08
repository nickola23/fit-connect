using FitConnect.Application.Common;
using FitConnect.Application.Equipment;
using FitConnect.Domain.Equipment;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public class ClientEquipmentRepository : IClientEquipmentRepository
{
    private readonly IDbConnectionFactory connectionFactory;

    public ClientEquipmentRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Equipment>> GetForClientAsync(Guid clientId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT e.id, e.name
            FROM equipment e
            INNER JOIN client_equipment ce ON ce.equipment_id = e.id
            WHERE ce.client_id = @clientId
            ORDER BY e.name
            """;

        await using var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.AddWithValue("clientId", clientId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<Equipment>();
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(new Equipment(reader.GetGuid(reader.GetOrdinal("id")), reader.GetString(reader.GetOrdinal("name"))));
        }

        return items;
    }

    public async Task AddAsync(Guid clientId, Guid equipmentId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            INSERT INTO client_equipment (client_id, equipment_id)
            VALUES (@clientId, @equipmentId)
            ON CONFLICT (client_id, equipment_id) DO NOTHING
            """;

        await using var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.AddWithValue("clientId", clientId);
        command.Parameters.AddWithValue("equipmentId", equipmentId);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task RemoveAsync(Guid clientId, Guid equipmentId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "DELETE FROM client_equipment WHERE client_id = @clientId AND equipment_id = @equipmentId";
        await using var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.AddWithValue("clientId", clientId);
        command.Parameters.AddWithValue("equipmentId", equipmentId);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }
}