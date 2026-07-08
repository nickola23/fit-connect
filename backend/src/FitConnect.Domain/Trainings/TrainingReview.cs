namespace FitConnect.Domain.Trainings;

public class TrainingReview
{
    public Guid Id { get; }
    public Guid TrainingId { get; }
    public Guid TrainerId { get; }
    public int Rating { get; }
    public string? Comment { get; }

    public bool VisibleToOtherTrainersOnly => true;

    public TrainingReview(Guid id, Guid trainingId, Guid trainerId, int rating, string? comment)
    {
        if (rating is < 1 or > 5)
        {
            throw new ArgumentOutOfRangeException(nameof(rating), "Rating must be between 1 and 5.");
        }

        Id = id;
        TrainingId = trainingId;
        TrainerId = trainerId;
        Rating = rating;
        Comment = comment;
    }
}