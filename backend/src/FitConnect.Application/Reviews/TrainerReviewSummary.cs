namespace FitConnect.Application.Reviews;

public record TrainerReviewSummary(double? AverageRating, int ReviewCount)
{
    public static TrainerReviewSummary Empty => new(null, 0);
}