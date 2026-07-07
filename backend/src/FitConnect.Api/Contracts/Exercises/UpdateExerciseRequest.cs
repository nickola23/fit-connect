namespace FitConnect.Api.Contracts.Exercises;

public class UpdateExerciseRequest
{
    public required string Name { get; init; }
    public required int DefaultReps { get; init; }
    public required int DefaultSets { get; init; }
}