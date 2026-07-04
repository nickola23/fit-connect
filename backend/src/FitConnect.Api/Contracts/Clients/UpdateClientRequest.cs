using FitConnect.Domain.Enums;

namespace FitConnect.Api.Contracts.Clients;

public class UpdateClientRequest
{
    public required string Name { get; init; }
    public string Language { get; init; } = "sr";
    public string? Goal { get; init; }
    public TrainingLocation? TrainingLocation { get; init; }
}