namespace FitConnect.Domain.Exceptions.Trainings;

public class ExerciseNotOwnedByTrainerException : Exception
{
    public ExerciseNotOwnedByTrainerException(Guid exerciseId)
        : base($"Exercise '{exerciseId}' does not belong to this cooperation's trainer.")
    {
    }
}