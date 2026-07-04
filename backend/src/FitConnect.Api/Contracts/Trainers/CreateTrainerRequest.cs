namespace FitConnect.Api.Contracts.Trainers;

public class CreateTrainerRequest
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; }
    public string Language { get; init; } = "sr";
    public string? Education { get; init; }
    public string? Bio { get; init; }
}