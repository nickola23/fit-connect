using FitConnect.Domain.Trainings;

namespace FitConnect.Api.Contracts.Trainings;

public class TrainingReviewResponse
{
    public required Guid Id { get; init; }
    public required Guid TrainingId { get; init; }
    public required Guid TrainerId { get; init; }
    public required int Rating { get; init; }
    public string? Comment { get; init; }

    public static TrainingReviewResponse FromDomain(TrainingReview review) => new()
    {
        Id = review.Id,
        TrainingId = review.TrainingId,
        TrainerId = review.TrainerId,
        Rating = review.Rating,
        Comment = review.Comment
    };
}