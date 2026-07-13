using FitConnect.Domain.Exercises;

namespace FitConnect.Api.Contracts.Exercises;

public class ExerciseResponse
{
    public required Guid Id { get; init; }
    public required Guid TrainerId { get; init; }
    public required string Name { get; init; }
    public string? Description { get; init; }
    public required int DefaultReps { get; init; }
    public required int DefaultSets { get; init; }
    public string? DemoVideoUrl { get; init; }

    public static ExerciseResponse FromDomain(Exercise exercise) => new()
    {
        Id = exercise.Id,
        TrainerId = exercise.TrainerId,
        Name = exercise.Name,
        Description = exercise.Description,
        DefaultReps = exercise.DefaultReps,
        DefaultSets = exercise.DefaultSets,
        DemoVideoUrl = exercise.DemoVideoUrl
    };
}