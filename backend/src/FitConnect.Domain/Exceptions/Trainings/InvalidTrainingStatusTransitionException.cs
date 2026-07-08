using FitConnect.Domain.Enums;

namespace FitConnect.Domain.Exceptions.Trainings;

public class InvalidTrainingStatusTransitionException : Exception
{
    public InvalidTrainingStatusTransitionException(TrainingStatus from, TrainingStatus to)
        : base($"Cannot transition training from '{from}' to '{to}'.")
    {
    }
}