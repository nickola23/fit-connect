namespace FitConnect.Domain.Exceptions.Trainings;

public class CooperationNotActiveForTrainingException : Exception
{
    public CooperationNotActiveForTrainingException(Guid cooperationId)
        : base($"Cooperation '{cooperationId}' must be accepted or active before assigning a training.")
    {
    }
}