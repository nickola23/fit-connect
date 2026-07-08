using System.ComponentModel.DataAnnotations;

namespace FitConnect.Api.Contracts.Trainings;

public class CreateTrainingReviewRequest
{
    [Range(1, 5)]
    public required int Rating { get; init; }
    public string? Comment { get; init; }
}