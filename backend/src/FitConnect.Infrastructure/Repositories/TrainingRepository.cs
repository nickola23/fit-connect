using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.Cooperations;
using FitConnect.Application.Trainings;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Trainings;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public class TrainingRepository : ITrainingRepository
{
    private const string BaseSelect = """
        SELECT t.id, t.cooperation_id, t.training_type, t.training_date, t.status,
               lt.meeting_link, at.target_date
        FROM trainings t
        LEFT JOIN live_trainings lt ON lt.training_id = t.id
        LEFT JOIN assigned_trainings at ON at.training_id = t.id
        """;

    private readonly IDbConnectionFactory connectionFactory;

    public TrainingRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<Training?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        await using var command = CreateCommand(connection, $"{BaseSelect} WHERE t.id = @id");
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    public async Task<IReadOnlyList<Training>> GetForCooperationAsync(Guid cooperationId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        await using var command = CreateCommand(connection, $"{BaseSelect} WHERE t.cooperation_id = @cooperationId ORDER BY t.training_date DESC");
        command.Parameters.AddWithValue("cooperationId", cooperationId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var trainings = new List<Training>();
        while (await reader.ReadAsync(cancellationToken))
        {
            trainings.Add(Map(reader));
        }

        return trainings;
    }

    public async Task<CooperationParticipants?> GetParticipantsAsync(Guid trainingId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT c.trainer_id, c.client_id
            FROM trainings t
            INNER JOIN cooperations c ON c.id = t.cooperation_id
            WHERE t.id = @id
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", trainingId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        if (!await reader.ReadAsync(cancellationToken))
        {
            return null;
        }

        return new CooperationParticipants(
            reader.GetGuid(reader.GetOrdinal("trainer_id")),
            reader.GetGuid(reader.GetOrdinal("client_id")));
    }

    public async Task<Training> CreateAsync(Training training, IReadOnlyList<TrainingExercise> exercises, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        const string insertTrainingSql = """
            INSERT INTO trainings (id, cooperation_id, training_type, training_date, status)
            VALUES (@id, @cooperationId, @type::training_type, @trainingDate, @status::training_status)
            """;

        await using (var command = CreateCommand(connection, insertTrainingSql, transaction))
        {
            command.Parameters.AddWithValue("id", training.Id);
            command.Parameters.AddWithValue("cooperationId", training.CooperationId);
            command.Parameters.AddWithValue("type", training.Type.ToString().ToUpperInvariant());
            command.Parameters.AddWithValue("trainingDate", training.TrainingDate);
            command.Parameters.AddWithValue("status", training.Status.ToString().ToUpperInvariant());
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        if (training is LiveTraining live)
        {
            const string sql = "INSERT INTO live_trainings (training_id, meeting_link) VALUES (@id, @meetingLink)";
            await using var command = CreateCommand(connection, sql, transaction);
            command.Parameters.AddWithValue("id", live.Id);
            command.Parameters.AddWithValue("meetingLink", (object?)live.MeetingLink ?? DBNull.Value);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
        else if (training is AssignedTraining assigned)
        {
            const string sql = "INSERT INTO assigned_trainings (training_id, target_date) VALUES (@id, @targetDate)";
            await using var command = CreateCommand(connection, sql, transaction);
            command.Parameters.AddWithValue("id", assigned.Id);
            command.Parameters.AddWithValue("targetDate", assigned.TargetDate);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        const string insertExerciseSql = """
            INSERT INTO training_exercises (id, training_id, exercise_id, assigned_reps, assigned_sets, completed, difficulty_rating, client_comment)
            VALUES (@id, @trainingId, @exerciseId, @assignedReps, @assignedSets, @completed, @difficultyRating, @clientComment)
            """;

        foreach (var exercise in exercises)
        {
            await using var command = CreateCommand(connection, insertExerciseSql, transaction);
            command.Parameters.AddWithValue("id", exercise.Id);
            command.Parameters.AddWithValue("trainingId", exercise.TrainingId);
            command.Parameters.AddWithValue("exerciseId", exercise.ExerciseId);
            command.Parameters.AddWithValue("assignedReps", (short)exercise.AssignedReps);
            command.Parameters.AddWithValue("assignedSets", (short)exercise.AssignedSets);
            command.Parameters.AddWithValue("completed", exercise.Completed);
            command.Parameters.AddWithValue("difficultyRating", (object?)exercise.DifficultyRating ?? DBNull.Value);
            command.Parameters.AddWithValue("clientComment", (object?)exercise.ClientComment ?? DBNull.Value);
            await command.ExecuteNonQueryAsync(cancellationToken);
        }

        await transaction.CommitAsync(cancellationToken);
        return training;
    }

    public async Task UpdateStatusAsync(Training training, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "UPDATE trainings SET status = @status::training_status WHERE id = @id";
        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", training.Id);
        command.Parameters.AddWithValue("status", training.Status.ToString().ToUpperInvariant());
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    private static NpgsqlCommand CreateCommand(DbConnection connection, string sql, DbTransaction? transaction = null)
    {
        var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        command.Transaction = (NpgsqlTransaction?)transaction;
        return command;
    }

    private static Training Map(DbDataReader reader)
    {
        var id = reader.GetGuid(reader.GetOrdinal("id"));
        var cooperationId = reader.GetGuid(reader.GetOrdinal("cooperation_id"));
        var type = Enum.Parse<TrainingType>(reader.GetString(reader.GetOrdinal("training_type")), ignoreCase: true);
        var date = reader.GetFieldValue<DateOnly>(reader.GetOrdinal("training_date"));
        var status = Enum.Parse<TrainingStatus>(reader.GetString(reader.GetOrdinal("status")), ignoreCase: true);

        return type switch
        {
            TrainingType.Live => new LiveTraining(id, cooperationId, date, status, ReadNullableString(reader, "meeting_link")),
            TrainingType.Assigned => new AssignedTraining(id, cooperationId, date, status, reader.GetFieldValue<DateOnly>(reader.GetOrdinal("target_date"))),
            _ => throw new InvalidOperationException($"Unknown training type '{type}'.")
        };
    }

    private static string? ReadNullableString(DbDataReader reader, string column)
    {
        var ordinal = reader.GetOrdinal(column);
        return reader.IsDBNull(ordinal) ? null : reader.GetString(ordinal);
    }
}