namespace FitConnect.Domain.Trainings;

public class TrainingExercise
{
    public Guid Id { get; }
    public Guid TrainingId { get; }
    public Guid ExerciseId { get; }
    public int AssignedReps { get; }
    public int AssignedSets { get; }
    public bool Completed { get; private set; }
    public int? DifficultyRating { get; private set; }
    public string? ClientComment { get; private set; }

    public TrainingExercise(
        Guid id, Guid trainingId, Guid exerciseId, int assignedReps, int assignedSets,
        bool completed, int? difficultyRating, string? clientComment)
    {
        Id = id;
        TrainingId = trainingId;
        ExerciseId = exerciseId;
        AssignedReps = assignedReps;
        AssignedSets = assignedSets;
        Completed = completed;
        DifficultyRating = difficultyRating;
        ClientComment = clientComment;
    }

    public void MarkDone(int? difficultyRating, string? comment)
    {
        if (difficultyRating is < 1 or > 5)
        {
            throw new ArgumentOutOfRangeException(nameof(difficultyRating), "Difficulty rating must be between 1 and 5.");
        }

        Completed = true;
        DifficultyRating = difficultyRating;
        ClientComment = comment;
    }
}