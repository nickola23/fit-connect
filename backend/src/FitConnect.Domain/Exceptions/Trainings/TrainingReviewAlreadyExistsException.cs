namespace FitConnect.Domain.Exceptions.Trainings;

public class TrainingReviewAlreadyExistsException : Exception
{
    public TrainingReviewAlreadyExistsException(Guid trainingId)
        : base($"Training '{trainingId}' already has a review.")
    {
    }
}