using System.ComponentModel.DataAnnotations;

namespace FitConnect.Api.Contracts.Trainings;

public class MarkTrainingExerciseDoneRequest
{
    [Range(1, 5)]
    public int? DifficultyRating { get; init; }
    public string? Comment { get; init; }
}