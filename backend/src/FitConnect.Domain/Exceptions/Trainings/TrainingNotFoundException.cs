namespace FitConnect.Domain.Exceptions.Trainings;

public class TrainingNotFoundException : Exception
{
    public TrainingNotFoundException(Guid trainingId)
        : base($"Training with id '{trainingId}' was not found.")
    {
    }
}