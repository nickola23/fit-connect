using FitConnect.Domain.Enums;

namespace FitConnect.Api.Contracts.Clients;

public class ClientResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Language { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
    public string? Goal { get; init; }
    public TrainingLocation? TrainingLocation { get; init; }
    public required bool FreeTrialUsed { get; init; }
}