using FitConnect.Domain.Enums;
using FitConnect.Domain.Exceptions.Trainings;

namespace FitConnect.Domain.Trainings;

public abstract class Training
{
    public Guid Id { get; }
    public Guid CooperationId { get; }
    public DateOnly TrainingDate { get; }
    public TrainingStatus Status { get; private set; }

    protected Training(Guid id, Guid cooperationId, DateOnly trainingDate, TrainingStatus status)
    {
        Id = id;
        CooperationId = cooperationId;
        TrainingDate = trainingDate;
        Status = status;
    }

    public abstract TrainingType Type { get; }

    public void MarkComplete()
    {
        EnsureScheduled(TrainingStatus.Completed);
        Status = TrainingStatus.Completed;
    }

    public void MarkMissed()
    {
        EnsureScheduled(TrainingStatus.Missed);
        Status = TrainingStatus.Missed;
    }

    private void EnsureScheduled(TrainingStatus target)
    {
        if (Status != TrainingStatus.Scheduled)
        {
            throw new InvalidTrainingStatusTransitionException(Status, target);
        }
    }
}