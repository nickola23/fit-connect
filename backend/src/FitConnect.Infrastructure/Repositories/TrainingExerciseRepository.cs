using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.Trainings;
using FitConnect.Domain.Trainings;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public class TrainingExerciseRepository : ITrainingExerciseRepository
{
    private readonly IDbConnectionFactory connectionFactory;

    public TrainingExerciseRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<TrainingExercise?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT id, training_id, exercise_id, assigned_reps, assigned_sets, completed, difficulty_rating, client_comment
            FROM training_exercises
            WHERE id = @id
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    public async Task<IReadOnlyList<TrainingExercise>> GetForTrainingAsync(Guid trainingId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT id, training_id, exercise_id, assigned_reps, assigned_sets, completed, difficulty_rating, client_comment
            FROM training_exercises
            WHERE training_id = @trainingId
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("trainingId", trainingId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var items = new List<TrainingExercise>();
        while (await reader.ReadAsync(cancellationToken))
        {
            items.Add(Map(reader));
        }

        return items;
    }

    public async Task<Guid?> GetOwningClientIdAsync(Guid trainingExerciseId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT c.client_id
            FROM training_exercises te
            INNER JOIN trainings t ON t.id = te.training_id
            INNER JOIN cooperations c ON c.id = t.cooperation_id
            WHERE te.id = @id
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", trainingExerciseId);

        var result = await command.ExecuteScalarAsync(cancellationToken);
        return result is null or DBNull ? null : (Guid)result;
    }

    public async Task UpdateAsync(TrainingExercise trainingExercise, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            UPDATE training_exercises
            SET completed = @completed, difficulty_rating = @difficultyRating, client_comment = @clientComment
            WHERE id = @id
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", trainingExercise.Id);
        command.Parameters.AddWithValue("completed", trainingExercise.Completed);
        command.Parameters.AddWithValue("difficultyRating", (object?)trainingExercise.DifficultyRating ?? DBNull.Value);
        command.Parameters.AddWithValue("clientComment", (object?)trainingExercise.ClientComment ?? DBNull.Value);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static NpgsqlCommand CreateCommand(DbConnection connection, string sql)
    {
        var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        return command;
    }

    private static TrainingExercise Map(DbDataReader reader)
    {
        var difficultyOrdinal = reader.GetOrdinal("difficulty_rating");
        var commentOrdinal = reader.GetOrdinal("client_comment");

        return new TrainingExercise(
            reader.GetGuid(reader.GetOrdinal("id")),
            reader.GetGuid(reader.GetOrdinal("training_id")),
            reader.GetGuid(reader.GetOrdinal("exercise_id")),
            reader.GetInt16(reader.GetOrdinal("assigned_reps")),
            reader.GetInt16(reader.GetOrdinal("assigned_sets")),
            reader.GetBoolean(reader.GetOrdinal("completed")),
            reader.IsDBNull(difficultyOrdinal) ? null : reader.GetInt16(difficultyOrdinal),
            reader.IsDBNull(commentOrdinal) ? null : reader.GetString(commentOrdinal));
    }
}