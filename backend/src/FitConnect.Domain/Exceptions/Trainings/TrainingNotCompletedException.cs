namespace FitConnect.Domain.Exceptions.Trainings;

public class TrainingNotCompletedException : Exception
{
    public TrainingNotCompletedException(Guid trainingId)
        : base($"Training '{trainingId}' must be completed before it can be reviewed.")
    {
    }
}