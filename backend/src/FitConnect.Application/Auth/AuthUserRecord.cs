using FitConnect.Domain.Enums;

namespace FitConnect.Application.Auth;

public record AuthUserRecord(Guid Id, string Name, string Email, string PasswordHash, UserRole Role);