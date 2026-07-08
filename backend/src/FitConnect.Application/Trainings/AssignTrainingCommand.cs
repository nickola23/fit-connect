using FitConnect.Domain.Enums;

namespace FitConnect.Application.Trainings;

public class AssignTrainingCommand
{
    public required Guid CooperationId { get; init; }
    public required TrainingType Type { get; init; }
    public required DateOnly TrainingDate { get; init; }
    public string? MeetingLink { get; init; }
    public DateOnly? TargetDate { get; init; }
    public required IReadOnlyList<TrainingExerciseAssignment> Exercises { get; init; }
}

public record TrainingExerciseAssignment(Guid ExerciseId, int Reps, int Sets);