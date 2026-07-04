namespace FitConnect.Api.Contracts.Trainers;

public class UpdateTrainerRequest
{
    public required string Name { get; init; }
    public string Language { get; init; } = "sr";
    public string? Education { get; init; }
    public string? Bio { get; init; }
}