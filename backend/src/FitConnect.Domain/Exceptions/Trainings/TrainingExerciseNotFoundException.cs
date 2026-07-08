namespace FitConnect.Domain.Exceptions.Trainings;

public class TrainingExerciseNotFoundException : Exception
{
    public TrainingExerciseNotFoundException(Guid trainingExerciseId)
        : base($"Training exercise with id '{trainingExerciseId}' was not found.")
    {
    }
}