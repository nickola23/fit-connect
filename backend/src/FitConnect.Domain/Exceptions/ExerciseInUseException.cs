namespace FitConnect.Domain.Exceptions;

public class ExerciseInUseException : Exception
{
    public ExerciseInUseException(Guid exerciseId)
        : base($"Exercise '{exerciseId}' cannot be deleted because it is used in one or more trainings.")
    {
    }
}