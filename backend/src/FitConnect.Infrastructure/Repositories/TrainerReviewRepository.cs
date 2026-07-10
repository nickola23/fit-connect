using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.Reviews;
using FitConnect.Domain.Reviews;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public class TrainerReviewRepository : ITrainerReviewRepository
{
    private readonly IDbConnectionFactory connectionFactory;

    public TrainerReviewRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<TrainerReview?> GetByTrainerAndClientAsync(Guid trainerId, Guid clientId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT id, trainer_id, client_id, rating, comment, review_date
            FROM trainer_reviews
            WHERE trainer_id = @trainerId AND client_id = @clientId
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("trainerId", trainerId);
        command.Parameters.AddWithValue("clientId", clientId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    public async Task<IReadOnlyList<TrainerReview>> GetForTrainerAsync(Guid trainerId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT id, trainer_id, client_id, rating, comment, review_date
            FROM trainer_reviews
            WHERE trainer_id = @trainerId
            ORDER BY review_date DESC
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("trainerId", trainerId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var reviews = new List<TrainerReview>();
        while (await reader.ReadAsync(cancellationToken))
        {
            reviews.Add(Map(reader));
        }

        return reviews;
    }

    public async Task<TrainerReview> CreateAsync(TrainerReview review, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            INSERT INTO trainer_reviews (id, trainer_id, client_id, rating, comment, review_date)
            VALUES (@id, @trainerId, @clientId, @rating, @comment, @reviewDate)
            """;

        await using var command = CreateCommand(connection, sql);
        AddParameters(command, review);
        await command.ExecuteNonQueryAsync(cancellationToken);

        return review;
    }

    public async Task UpdateAsync(TrainerReview review, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            UPDATE trainer_reviews
            SET rating = @rating, comment = @comment, review_date = @reviewDate
            WHERE id = @id
            """;

        await using var command = CreateCommand(connection, sql);
        AddParameters(command, review);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task<IReadOnlyDictionary<Guid, TrainerReviewSummary>> GetSummariesAsync(
        IReadOnlyList<Guid> trainerIds, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT trainer_id, AVG(rating)::double precision AS avg_rating, COUNT(*) AS review_count
            FROM trainer_reviews
            WHERE trainer_id = ANY(@trainerIds)
            GROUP BY trainer_id
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("trainerIds", trainerIds.ToArray());

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var summaries = new Dictionary<Guid, TrainerReviewSummary>();
        while (await reader.ReadAsync(cancellationToken))
        {
            summaries[reader.GetGuid(reader.GetOrdinal("trainer_id"))] = new TrainerReviewSummary(
                reader.GetDouble(reader.GetOrdinal("avg_rating")),
                (int)reader.GetInt64(reader.GetOrdinal("review_count")));
        }

        return summaries;
    }

    private static void AddParameters(NpgsqlCommand command, TrainerReview review)
    {
        command.Parameters.AddWithValue("id", review.Id);
        command.Parameters.AddWithValue("trainerId", review.TrainerId);
        command.Parameters.AddWithValue("clientId", review.ClientId);
        command.Parameters.AddWithValue("rating", (short)review.Rating);
        command.Parameters.AddWithValue("comment", (object?)review.Comment ?? DBNull.Value);
        command.Parameters.AddWithValue("reviewDate", review.ReviewDate);
    }

    private static NpgsqlCommand CreateCommand(DbConnection connection, string sql)
    {
        var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        return command;
    }

    private static TrainerReview Map(DbDataReader reader)
    {
        var commentOrdinal = reader.GetOrdinal("comment");
        return new TrainerReview(
            reader.GetGuid(reader.GetOrdinal("id")),
            reader.GetGuid(reader.GetOrdinal("trainer_id")),
            reader.GetGuid(reader.GetOrdinal("client_id")),
            reader.GetInt16(reader.GetOrdinal("rating")),
            reader.IsDBNull(commentOrdinal) ? null : reader.GetString(commentOrdinal),
            reader.GetFieldValue<DateOnly>(reader.GetOrdinal("review_date")));
    }
}