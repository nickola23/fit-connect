using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.Credentials;
using FitConnect.Domain.Credentials;
using FitConnect.Domain.Enums;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public class CredentialRepository : ICredentialRepository
{
    private readonly IDbConnectionFactory connectionFactory;

    public CredentialRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<Credential?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "SELECT id, trainer_id, type, file_url, issued_by, upload_date FROM credentials WHERE id = @id";
        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    public async Task<IReadOnlyList<Credential>> GetForTrainerAsync(Guid trainerId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT id, trainer_id, type, file_url, issued_by, upload_date
            FROM credentials
            WHERE trainer_id = @trainerId
            ORDER BY upload_date DESC
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("trainerId", trainerId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<Credential>();
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(Map(reader));
        }

        return items;
    }

    public async Task<Credential> CreateAsync(Credential credential, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            INSERT INTO credentials (id, trainer_id, type, file_url, issued_by, upload_date)
            VALUES (@id, @trainerId, @type::credential_type, @fileUrl, @issuedBy, @uploadDate)
            """;

        await using var command = CreateCommand(connection, sql);
        AddParameters(command, credential);
        await command.ExecuteNonQueryAsync(cancellationToken);

        return credential;
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "DELETE FROM credentials WHERE id = @id";
        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static void AddParameters(NpgsqlCommand command, Credential credential)
    {
        command.Parameters.AddWithValue("id", credential.Id);
        command.Parameters.AddWithValue("trainerId", credential.TrainerId);
        command.Parameters.AddWithValue("type", credential.Type.ToString().ToUpperInvariant() switch
        {
            "COURSECERTIFICATE" => "COURSE_CERTIFICATE",
            var other => other
        });
        command.Parameters.AddWithValue("fileUrl", credential.FileUrl);
        command.Parameters.AddWithValue("issuedBy", (object?)credential.IssuedBy ?? DBNull.Value);
        command.Parameters.AddWithValue("uploadDate", credential.UploadDate);
    }

    private static NpgsqlCommand CreateCommand(DbConnection connection, string sql)
    {
        var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        return command;
    }

    private static Credential Map(DbDataReader reader)
    {
        var issuedByOrdinal = reader.GetOrdinal("issued_by");
        var typeText = reader.GetString(reader.GetOrdinal("type")).Replace("_", "");
        var type = Enum.Parse<CredentialType>(typeText, ignoreCase: true);

        return new Credential(
            reader.GetGuid(reader.GetOrdinal("id")),
            reader.GetGuid(reader.GetOrdinal("trainer_id")),
            type,
            reader.GetString(reader.GetOrdinal("file_url")),
            reader.IsDBNull(issuedByOrdinal) ? null : reader.GetString(issuedByOrdinal),
            reader.GetFieldValue<DateOnly>(reader.GetOrdinal("upload_date")));
    }
}