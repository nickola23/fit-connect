using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.Trainings;
using FitConnect.Domain.Exceptions.Trainings;
using FitConnect.Domain.Trainings;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public class TrainingReviewRepository : ITrainingReviewRepository
{
    private readonly IDbConnectionFactory connectionFactory;

    public TrainingReviewRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<TrainingReview?> GetByTrainingIdAsync(Guid trainingId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "SELECT id, training_id, trainer_id, rating, comment FROM training_reviews WHERE training_id = @trainingId";
        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("trainingId", trainingId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        var commentOrdinal = reader.GetOrdinal("comment");
        return new TrainingReview(
            reader.GetGuid(reader.GetOrdinal("id")),
            reader.GetGuid(reader.GetOrdinal("training_id")),
            reader.GetGuid(reader.GetOrdinal("trainer_id")),
            reader.GetInt16(reader.GetOrdinal("rating")),
            reader.IsDBNull(commentOrdinal) ? null : reader.GetString(commentOrdinal));
    }

    public async Task<TrainingReview> CreateAsync(TrainingReview review, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            INSERT INTO training_reviews (id, training_id, trainer_id, rating, comment, visible_to_other_trainers_only)
            VALUES (@id, @trainingId, @trainerId, @rating, @comment, TRUE)
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", review.Id);
        command.Parameters.AddWithValue("trainingId", review.TrainingId);
        command.Parameters.AddWithValue("trainerId", review.TrainerId);
        command.Parameters.AddWithValue("rating", (short)review.Rating);
        command.Parameters.AddWithValue("comment", (object?)review.Comment ?? DBNull.Value);

        try
        {
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.UniqueViolation)
        {
            throw new TrainingReviewAlreadyExistsException(review.TrainingId);
        }

        return review;
    }

    private static NpgsqlCommand CreateCommand(DbConnection connection, string sql)
    {
        var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        return command;
    }
}