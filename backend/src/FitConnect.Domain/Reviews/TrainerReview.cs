namespace FitConnect.Domain.Reviews;

public class TrainerReview
{
    public Guid Id { get; }
    public Guid TrainerId { get; }
    public Guid ClientId { get; }
    public int Rating { get; private set; }
    public string? Comment { get; private set; }
    public DateOnly ReviewDate { get; private set; }

    public TrainerReview(Guid id, Guid trainerId, Guid clientId, int rating, string? comment, DateOnly reviewDate)
    {
        ValidateRating(rating);
        Id = id;
        TrainerId = trainerId;
        ClientId = clientId;
        Rating = rating;
        Comment = comment;
        ReviewDate = reviewDate;
    }

    public void UpdateReview(int rating, string? comment)
    {
        ValidateRating(rating);
        Rating = rating;
        Comment = comment;
        ReviewDate = DateOnly.FromDateTime(DateTime.UtcNow);
    }

    private static void ValidateRating(int rating)
    {
        if (rating is < 1 or > 5)
        {
            throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 1 and 5.");
        }
    }
}