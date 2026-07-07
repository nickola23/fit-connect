namespace FitConnect.Domain.Exceptions;

public class ExerciseNotFoundException : Exception
{
    public ExerciseNotFoundException(Guid exerciseId)
        : base($"Exercise with id '{exerciseId}' was not found.")
    {
    }
}