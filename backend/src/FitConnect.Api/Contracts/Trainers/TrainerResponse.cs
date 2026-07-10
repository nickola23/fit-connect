using FitConnect.Domain.Enums;

namespace FitConnect.Api.Contracts.Trainers;

public class TrainerResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Language { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public required RegistrationStatus RegistrationStatus { get; init; }
    public string? Education { get; init; }
    public string? Bio { get; init; }
    public DateTimeOffset? ApprovedAt { get; init; }
    public double? AverageRating { get; init; }
    public required int ReviewCount { get; init; }
}