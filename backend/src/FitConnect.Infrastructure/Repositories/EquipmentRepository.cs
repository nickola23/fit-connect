using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.Equipment;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Exceptions;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public class EquipmentRepository : IEquipmentRepository
{
    private readonly IDbConnectionFactory connectionFactory;

    public EquipmentRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<Domain.Equipment.Equipment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "SELECT id, name, type FROM equipment WHERE id = @id";
        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    public async Task<IReadOnlyList<Domain.Equipment.Equipment>> GetAllAsync(EquipmentType? typeFilter = null, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var sql = "SELECT id, name, type FROM equipment";
        if (typeFilter is not null)
        {
            sql += " WHERE type = @type::equipment_type";
        }
        sql += " ORDER BY name";

        await using var command = CreateCommand(connection, sql);
        if (typeFilter is not null)
        {
            command.Parameters.AddWithValue("type", typeFilter.Value.ToString().ToUpperInvariant());
        }

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<Domain.Equipment.Equipment>();
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(Map(reader));
        }

        return items;
    }

    public async Task<Domain.Equipment.Equipment> CreateAsync(Domain.Equipment.Equipment equipment, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "INSERT INTO equipment (id, name, type) VALUES (@id, @name, @type::equipment_type)";
        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", equipment.Id);
        command.Parameters.AddWithValue("name", equipment.Name);
        command.Parameters.AddWithValue("type", equipment.Type.ToString().ToUpperInvariant());

        try
        {
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new DuplicateEquipmentNameException(equipment.Name);
        }

        return equipment;
    }

    public async Task UpdateAsync(Domain.Equipment.Equipment equipment, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "UPDATE equipment SET name = @name, type = @type::equipment_type WHERE id = @id";
        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", equipment.Id);
        command.Parameters.AddWithValue("name", equipment.Name);
        command.Parameters.AddWithValue("type", equipment.Type.ToString().ToUpperInvariant());

        try
        {
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new DuplicateEquipmentNameException(equipment.Name);
        }
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "DELETE FROM equipment WHERE id = @id";
        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task<bool> IsReferencedAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT EXISTS(SELECT 1 FROM exercise_equipment WHERE equipment_id = @id)
                OR EXISTS(SELECT 1 FROM client_equipment WHERE equipment_id = @id)
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);
        return (bool)(await command.ExecuteScalarAsync(cancellationToken))!;
    }

    private static NpgsqlCommand CreateCommand(DbConnection connection, string sql)
    {
        var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        return command;
    }

    private static Domain.Equipment.Equipment Map(DbDataReader reader) => new(
        reader.GetGuid(reader.GetOrdinal("id")),
        reader.GetString(reader.GetOrdinal("name")),
        Enum.Parse<EquipmentType>(reader.GetString(reader.GetOrdinal("type")), ignoreCase: true));
}