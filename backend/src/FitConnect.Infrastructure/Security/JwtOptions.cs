namespace FitConnect.Infrastructure.Security;

public class JwtOptions
{
    public required string Issuer { get; init; }
    public required string Audience { get; init; }
    public required string SigningKey { get; init; }
    public int ExpiryMinutes { get; init; } = 60;
}