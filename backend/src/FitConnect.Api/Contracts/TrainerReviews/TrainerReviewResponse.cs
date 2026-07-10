using FitConnect.Domain.Reviews;

namespace FitConnect.Api.Contracts.TrainerReviews;

public class TrainerReviewResponse
{
    public required Guid Id { get; init; }
    public required Guid TrainerId { get; init; }
    public required Guid ClientId { get; init; }
    public required int Rating { get; init; }
    public string? Comment { get; init; }
    public required DateOnly ReviewDate { get; init; }

    public static TrainerReviewResponse FromDomain(TrainerReview review) => new()
    {
        Id = review.Id,
        TrainerId = review.TrainerId,
        ClientId = review.ClientId,
        Rating = review.Rating,
        Comment = review.Comment,
        ReviewDate = review.ReviewDate
    };
}