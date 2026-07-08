using FitConnect.Domain.Enums;

namespace FitConnect.Domain.Trainings;

public class AssignedTraining : Training
{
    public DateOnly TargetDate { get; }

    public AssignedTraining(Guid id, Guid cooperationId, DateOnly trainingDate, TrainingStatus status, DateOnly targetDate)
        : base(id, cooperationId, trainingDate, status)
    {
        TargetDate = targetDate;
    }

    public override TrainingType Type => TrainingType.Assigned;
}