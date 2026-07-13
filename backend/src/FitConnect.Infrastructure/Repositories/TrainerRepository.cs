using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.Users;
using FitConnect.Domain.Credentials;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Users;

namespace FitConnect.Infrastructure.Repositories;

public class TrainerRepository : UserRepositoryBase, ITrainerRepository
{
    public TrainerRepository(IDbConnectionFactory connectionFactory) : base(connectionFactory)
    {
    }

    public async Task<Trainer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT u.id, u.name, u.email, u.password_hash, u.language, u.created_at,
                   t.registration_status, t.education, t.bio, t.approved_at
            FROM users u
            INNER JOIN trainers t ON t.user_id = u.id
            WHERE u.id = @id
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? MapTrainer(reader) : null;
    }

    public async Task<PagedResult<Trainer>> GetAllAsync(int page, int pageSize, RegistrationStatus? statusFilter,
        TrainerSortBy sortBy, bool descending, CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);

        var countSql = "SELECT COUNT(*) FROM trainers t";
        var sql = """
            SELECT u.id, u.name, u.email, u.password_hash, u.language, u.created_at,
                   t.registration_status, t.education, t.bio, t.approved_at
            FROM users u
            INNER JOIN trainers t ON t.user_id = u.id
            """;

        if (statusFilter is not null)
        {
            countSql += " WHERE t.registration_status = @status::registration_status";
            sql += " WHERE t.registration_status = @status::registration_status";
        }

        var orderClause = sortBy switch
        {
            TrainerSortBy.AverageRating => descending
                ? "(SELECT AVG(rating) FROM trainer_reviews WHERE trainer_id = t.user_id) DESC NULLS LAST"
                : "(SELECT AVG(rating) FROM trainer_reviews WHERE trainer_id = t.user_id) ASC NULLS LAST",
            _ => descending ? "u.name DESC" : "u.name ASC"
        };

        sql += $" ORDER BY {orderClause} LIMIT @pageSize OFFSET @offset";

        await using var countCommand = CreateCommand(connection, countSql);
        if (statusFilter is not null)
        {
            countCommand.Parameters.AddWithValue("status", statusFilter.Value.ToString().ToUpperInvariant());
        }
        var totalCount = (long)(await countCommand.ExecuteScalarAsync(cancellationToken))!;

        await using var command = CreateCommand(connection, sql);
        if (statusFilter is not null)
        {
            command.Parameters.AddWithValue("status", statusFilter.Value.ToString().ToUpperInvariant());
        }
        command.Parameters.AddWithValue("pageSize", pageSize);
        command.Parameters.AddWithValue("offset", (page - 1) * pageSize);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var trainers = new List<Trainer>();
        while (await reader.ReadAsync(cancellationToken))
        {
            trainers.Add(MapTrainer(reader));
        }

        return new PagedResult<Trainer> { Items = trainers, TotalCount = (int)totalCount, Page = page, PageSize = pageSize };
    }

    public async Task<Trainer> CreateAsync(Trainer trainer, IReadOnlyList<Credential> credentials, CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await InsertUserAsync(connection, transaction, trainer, "TRAINER", cancellationToken);

        const string trainerSql = """
            INSERT INTO trainers (user_id, registration_status, education, bio, approved_at)
            VALUES (@id, @status::registration_status, @education, @bio, @approvedAt)
            """;

        await using (var command = CreateCommand(connection, trainerSql, transaction))
        {
            AddTrainerParameters(command, trainer);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        const string credentialSql = """
            INSERT INTO credentials (id, trainer_id, type, file_url, issued_by, upload_date)
            VALUES (@id, @trainerId, @type::credential_type, @fileUrl, @issuedBy, @uploadDate)
            """;

        foreach (var credential in credentials)
        {
            await using var command = CreateCommand(connection, credentialSql, transaction);
            command.Parameters.AddWithValue("id", credential.Id);
            command.Parameters.AddWithValue("trainerId", credential.TrainerId);
            command.Parameters.AddWithValue("type", credential.Type == CredentialType.CourseCertificate ? "COURSE_CERTIFICATE" : credential.Type.ToString().ToUpperInvariant());
            command.Parameters.AddWithValue("fileUrl", credential.FileUrl);
            command.Parameters.AddWithValue("issuedBy", (object?)credential.IssuedBy ?? DBNull.Value);
            command.Parameters.AddWithValue("uploadDate", credential.UploadDate);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
        return trainer;
    }

    public async Task UpdateAsync(Trainer trainer, CancellationToken cancellationToken = default)
    {
        await using var connection = await ConnectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        await UpdateUserCoreAsync(connection, trainer.Id, trainer.Name, trainer.Language, cancellationToken);

        const string sql = """
            UPDATE trainers
            SET registration_status = @status::registration_status, education = @education, bio = @bio, approved_at = @approvedAt
            WHERE user_id = @id
            """;

        await using (var command = CreateCommand(connection, sql, transaction))
        {
            AddTrainerParameters(command, trainer);
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

    private static void AddTrainerParameters(Npgsql.NpgsqlCommand command, Trainer trainer)
    {
        command.Parameters.AddWithValue("id", trainer.Id);
        command.Parameters.AddWithValue("status", trainer.RegistrationStatus.ToString().ToUpperInvariant());
        command.Parameters.AddWithValue("education", (object?)trainer.Education ?? DBNull.Value);
        command.Parameters.AddWithValue("bio", (object?)trainer.Bio ?? DBNull.Value);
        command.Parameters.AddWithValue("approvedAt", (object?)trainer.ApprovedAt ?? DBNull.Value);
    }

    private static Trainer MapTrainer(DbDataReader reader)
    {
        var (id, name, email, passwordHash, language, createdAt) = ReadUserColumns(reader);
        var status = Enum.Parse<RegistrationStatus>(reader.GetString(reader.GetOrdinal("registration_status")), ignoreCase: true);
        var education = reader.IsDBNull(reader.GetOrdinal("education")) ? null : reader.GetString(reader.GetOrdinal("education"));
        var bio = reader.IsDBNull(reader.GetOrdinal("bio")) ? null : reader.GetString(reader.GetOrdinal("bio"));
        var approvedAt = reader.IsDBNull(reader.GetOrdinal("approved_at"))
            ? (DateTimeOffset?)null
            : reader.GetFieldValue<DateTimeOffset>(reader.GetOrdinal("approved_at"));

        return new Trainer(id, name, email, passwordHash, language, createdAt, status, education, bio, approvedAt);
    }
}