using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.Exercises;
using FitConnect.Domain.Exceptions;
using FitConnect.Domain.Exercises;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public class ExerciseRepository : IExerciseRepository
{
    private readonly IDbConnectionFactory connectionFactory;

    public ExerciseRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<Exercise?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT id, trainer_id, name, description, default_reps, default_sets, demo_video_url
            FROM exercises
            WHERE id = @id
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        return await reader.ReadAsync(cancellationToken) ? Map(reader) : null;
    }

    public async Task<IReadOnlyList<Exercise>> GetForTrainerAsync(Guid trainerId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT id, trainer_id, name, description, default_reps, default_sets, demo_video_url
            FROM exercises
            WHERE trainer_id = @trainerId
            ORDER BY name
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("trainerId", trainerId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var exercises = new List<Exercise>();
        while (await reader.ReadAsync(cancellationToken))
        {
            exercises.Add(Map(reader));
        }

        return exercises;
    }

    public async Task<Exercise> CreateAsync(Exercise exercise, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            INSERT INTO exercises (id, trainer_id, name, description, default_reps, default_sets, demo_video_url)
            VALUES (@id, @trainerId, @name, @description, @defaultReps, @defaultSets, @demoVideoUrl)
            """;

        await using var command = CreateCommand(connection, sql);
        AddParameters(command, exercise);
        await command.ExecuteNonQueryAsync(cancellationToken);

        return exercise;
    }

    public async Task UpdateAsync(Exercise exercise, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            UPDATE exercises
            SET name = @name, description = @description, default_reps = @defaultReps, default_sets = @defaultSets, demo_video_url = @demoVideoUrl
            WHERE id = @id
            """;

        await using var command = CreateCommand(connection, sql);
        AddParameters(command, exercise);
        await command.ExecuteNonQueryAsync(cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = "DELETE FROM exercises WHERE id = @id";
        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", id);

        try
        {
            await command.ExecuteNonQueryAsync(cancellationToken);
        }
        catch (PostgresException ex) when (ex.SqlState == PostgresErrorCodes.ForeignKeyViolation)
        {
            throw new ExerciseInUseException(id);
        }
    }

    private static void AddParameters(NpgsqlCommand command, Exercise exercise)
    {
        command.Parameters.AddWithValue("id", exercise.Id);
        command.Parameters.AddWithValue("trainerId", exercise.TrainerId);
        command.Parameters.AddWithValue("name", exercise.Name);
        command.Parameters.AddWithValue("description", (object?)exercise.Description ?? DBNull.Value);
        command.Parameters.AddWithValue("defaultReps", (short)exercise.DefaultReps);
        command.Parameters.AddWithValue("defaultSets", (short)exercise.DefaultSets);
        command.Parameters.AddWithValue("demoVideoUrl", (object?)exercise.DemoVideoUrl ?? DBNull.Value);
    }

    private static NpgsqlCommand CreateCommand(DbConnection connection, string sql)
    {
        var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        return command;
    }

    private static Exercise Map(DbDataReader reader)
    {
        var descriptionOrdinal = reader.GetOrdinal("description");
        var demoUrlOrdinal = reader.GetOrdinal("demo_video_url");
        return new Exercise(
            reader.GetGuid(reader.GetOrdinal("id")),
            reader.GetGuid(reader.GetOrdinal("trainer_id")),
            reader.GetString(reader.GetOrdinal("name")),
            reader.IsDBNull(descriptionOrdinal) ? null : reader.GetString(descriptionOrdinal),
            reader.GetInt16(reader.GetOrdinal("default_reps")),
            reader.GetInt16(reader.GetOrdinal("default_sets")),
            reader.IsDBNull(demoUrlOrdinal) ? null : reader.GetString(demoUrlOrdinal));
    }
    
    public async Task<IReadOnlyList<Exercise>> GetByIdsAsync(IReadOnlyList<Guid> ids, CancellationToken cancellationToken = default)
    {
        if (ids.Count == 0)
        {
            return Array.Empty<Exercise>();
        }

        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
                           SELECT id, trainer_id, name, description, default_reps, default_sets, demo_video_url
                           FROM exercises
                           WHERE id = ANY(@ids)
                           """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("ids", ids.ToArray());

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var exercises = new List<Exercise>();
        while (await reader.ReadAsync(cancellationToken))
        {
            exercises.Add(Map(reader));
        }

        return exercises;
    }
}