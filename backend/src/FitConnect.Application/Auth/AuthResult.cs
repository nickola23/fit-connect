using FitConnect.Domain.Enums;

namespace FitConnect.Application.Auth;

public record AuthResult(string Token, DateTimeOffset ExpiresAt, Guid UserId, string Name, string Email, UserRole Role);
