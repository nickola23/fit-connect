using FitConnect.Domain.Enums;
using FitConnect.Domain.Trainings;

namespace FitConnect.Api.Contracts.Trainings;

public class TrainingResponse
{
    public required Guid Id { get; init; }
    public required Guid CooperationId { get; init; }
    public required TrainingType Type { get; init; }
    public required DateOnly TrainingDate { get; init; }
    public required TrainingStatus Status { get; init; }
    public string? MeetingLink { get; init; }
    public DateOnly? TargetDate { get; init; }

    public static TrainingResponse FromDomain(Training training) => new()
    {
        Id = training.Id,
        CooperationId = training.CooperationId,
        Type = training.Type,
        TrainingDate = training.TrainingDate,
        Status = training.Status,
        MeetingLink = (training as LiveTraining)?.MeetingLink,
        TargetDate = (training as AssignedTraining)?.TargetDate
    };
}