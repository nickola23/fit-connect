using System.ComponentModel.DataAnnotations;

namespace FitConnect.Api.Contracts.TrainerReviews;

public class UpsertTrainerReviewRequest
{
    [Range(1, 5)]
    public required int Rating { get; init; }
    public string? Comment { get; init; }
}