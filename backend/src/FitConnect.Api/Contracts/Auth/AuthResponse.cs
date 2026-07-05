namespace FitConnect.Api.Contracts.Auth;

public class AuthResponse
{
    public required string Token { get; init; }
    public required DateTimeOffset ExpiresAt { get; init; }
    public required AuthenticatedUser User { get; init; }
}

public class AuthenticatedUser
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }
    public required string Email { get; init; }
    public required string Role { get; init; }
}