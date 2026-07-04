namespace FitConnect.Api.Contracts.Admins;

public class AdminResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Language { get; init; }
    public required DateTimeOffset CreatedAt { get; init; }
}