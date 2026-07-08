using FitConnect.Application.Common;
using FitConnect.Application.Equipment;
using FitConnect.Domain.Equipment;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public class ExerciseEquipmentRepository : IExerciseEquipmentRepository
{
    private readonly IDbConnectionFactory connectionFactory;

    public ExerciseEquipmentRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Equipment>> GetForExerciseAsync(Guid exerciseId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT e.id, e.name
            FROM equipment e
            INNER JOIN exercise_equipment ee ON ee.equipment_id = e.id
            WHERE ee.exercise_id = @exerciseId
            ORDER BY e.name
            """;

        await using var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.AddWithValue("exerciseId", exerciseId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<Equipment>();
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(new Equipment(reader.GetGuid(reader.GetOrdinal("id")), reader.GetString(reader.GetOrdinal("name"))));
        }

        return items;
    }

    public async Task AddAsync(Guid exerciseId, Guid equipmentId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            INSERT INTO exercise_equipment (exercise_id, equipment_id)
            VALUES (@exerciseId, @equipmentId)
            ON CONFLICT (exercise_id, equipment_id) DO NOTHING
            """;

        await using var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.AddWithValue("exerciseId", exerciseId);
        command.Parameters.AddWithValue("equipmentId", equipmentId);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task RemoveAsync(Guid exerciseId, Guid equipmentId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "DELETE FROM exercise_equipment WHERE exercise_id = @exerciseId AND equipment_id = @equipmentId";
        await using var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        command.Parameters.AddWithValue("exerciseId", exerciseId);
        command.Parameters.AddWithValue("equipmentId", equipmentId);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }
}