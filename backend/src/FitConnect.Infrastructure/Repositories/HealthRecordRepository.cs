using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.HealthRecords;
using FitConnect.Domain.HealthRecords;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public class HealthRecordRepository : IHealthRecordRepository
{
    private readonly IDbConnectionFactory connectionFactory;

    public HealthRecordRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<HealthRecord>> GetForClientAsync(
        Guid clientId, DateOnly? fromDate, DateOnly? toDate, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var sql = """
            SELECT id, client_id, record_date, weight, height, health_condition
            FROM health_records
            WHERE client_id = @clientId
            """;

        if (fromDate is not null)
        {
            sql += " AND record_date >= @fromDate";
        }

        if (toDate is not null)
        {
            sql += " AND record_date <= @toDate";
        }

        sql += " ORDER BY record_date DESC";

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("clientId", clientId);
        if (fromDate is not null)
        {
            command.Parameters.AddWithValue("fromDate", fromDate.Value);
        }
        if (toDate is not null)
        {
            command.Parameters.AddWithValue("toDate", toDate.Value);
        }

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var records = new List<HealthRecord>();
        while (await reader.ReadAsync(cancellationToken))
        {
            records.Add(Map(reader));
        }

        return records;
    }

    public async Task<HealthRecord> CreateAsync(HealthRecord record, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            INSERT INTO health_records (id, client_id, record_date, weight, height, health_condition)
            VALUES (@id, @clientId, @recordDate, @weight, @height, @healthCondition)
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", record.Id);
        command.Parameters.AddWithValue("clientId", record.ClientId);
        command.Parameters.AddWithValue("recordDate", record.RecordDate);
        command.Parameters.AddWithValue("weight", (object?)record.Weight ?? DBNull.Value);
        command.Parameters.AddWithValue("height", (object?)record.Height ?? DBNull.Value);
        command.Parameters.AddWithValue("healthCondition", (object?)record.HealthCondition ?? DBNull.Value);
        await command.ExecuteNonQueryAsync(cancellationToken);

        return record;
    }

    private static NpgsqlCommand CreateCommand(DbConnection connection, string sql)
    {
        var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        return command;
    }

    private static HealthRecord Map(DbDataReader reader)
    {
        var weightOrdinal = reader.GetOrdinal("weight");
        var heightOrdinal = reader.GetOrdinal("height");
        var conditionOrdinal = reader.GetOrdinal("health_condition");

        return new HealthRecord(
            reader.GetGuid(reader.GetOrdinal("id")),
            reader.GetGuid(reader.GetOrdinal("client_id")),
            reader.GetFieldValue<DateOnly>(reader.GetOrdinal("record_date")),
            reader.IsDBNull(weightOrdinal) ? null : reader.GetDecimal(weightOrdinal),
            reader.IsDBNull(heightOrdinal) ? null : reader.GetDecimal(heightOrdinal),
            reader.IsDBNull(conditionOrdinal) ? null : reader.GetString(conditionOrdinal));
    }
}