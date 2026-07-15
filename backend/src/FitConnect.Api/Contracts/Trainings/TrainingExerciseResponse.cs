using FitConnect.Domain.Trainings;

namespace FitConnect.Api.Contracts.Trainings;

public class TrainingExerciseResponse
{
    public required Guid Id { get; init; }
    public required Guid TrainingId { get; init; }
    public required Guid ExerciseId { get; init; }
    public required string ExerciseName { get; init; }
    public required int AssignedReps { get; init; }
    public required int AssignedSets { get; init; }
    public required bool Completed { get; init; }
    public int? DifficultyRating { get; init; }
    public string? ClientComment { get; init; }

    public static TrainingExerciseResponse FromDomain(TrainingExercise exercise, string exerciseName) => new()
    {
        Id = exercise.Id,
        TrainingId = exercise.TrainingId,
        ExerciseId = exercise.ExerciseId,
        ExerciseName = exerciseName,
        AssignedReps = exercise.AssignedReps,
        AssignedSets = exercise.AssignedSets,
        Completed = exercise.Completed,
        DifficultyRating = exercise.DifficultyRating,
        ClientComment = exercise.ClientComment
    };
}