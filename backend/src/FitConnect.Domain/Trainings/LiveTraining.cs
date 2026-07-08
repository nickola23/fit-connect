using FitConnect.Domain.Enums;

namespace FitConnect.Domain.Trainings;

public class LiveTraining : Training
{
    public string? MeetingLink { get; }

    public LiveTraining(Guid id, Guid cooperationId, DateOnly trainingDate, TrainingStatus status, string? meetingLink)
        : base(id, cooperationId, trainingDate, status)
    {
        MeetingLink = meetingLink;
    }

    public override TrainingType Type => TrainingType.Live;
}