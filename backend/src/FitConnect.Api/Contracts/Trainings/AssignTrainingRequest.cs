using System.ComponentModel.DataAnnotations;
using FitConnect.Domain.Enums;

namespace FitConnect.Api.Contracts.Trainings;

public class AssignTrainingRequest
{
    public required TrainingType Type { get; init; }
    public required DateOnly TrainingDate { get; init; }
    public string? MeetingLink { get; init; }
    public DateOnly? TargetDate { get; init; }

    [MinLength(1)]
    public required IReadOnlyList<TrainingExerciseAssignmentRequest> Exercises { get; init; }
}

public class TrainingExerciseAssignmentRequest
{
    public required Guid ExerciseId { get; init; }
    public required int Reps { get; init; }
    public required int Sets { get; init; }
}