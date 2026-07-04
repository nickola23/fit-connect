using FitConnect.Domain.Enums;

namespace FitConnect.Domain.Users;

public class Client : User
{
    public string? Goal { get; private set; }
    public TrainingLocation? TrainingLocation { get; private set; }
    public bool FreeTrialUsed { get; private set; }

    public Client(
        Guid id,
        string name,
        string email,
        string passwordHash,
        string language,
        DateTimeOffset createdAt,
        string? goal,
        TrainingLocation? trainingLocation,
        bool freeTrialUsed)
        : base(id, name, email, passwordHash, language, createdAt)
    {
        Goal = goal;
        TrainingLocation = trainingLocation;
        FreeTrialUsed = freeTrialUsed;
    }

    public override UserRole Role => UserRole.Client;

    public void UpdateGoalAndLocation(string? goal, TrainingLocation? trainingLocation)
    {
        Goal = goal;
        TrainingLocation = trainingLocation;
    }
}