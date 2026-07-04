namespace FitConnect.Api.Contracts.Admins;

public class CreateAdminRequest
{
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Password { get; init; }
    public string Language { get; init; } = "sr";
}