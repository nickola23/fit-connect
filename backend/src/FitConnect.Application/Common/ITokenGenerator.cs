using FitConnect.Domain.Enums;

namespace FitConnect.Application.Common;

public interface ITokenGenerator
{
    GeneratedToken Generate(Guid userId, string email, string name, UserRole role);
}

public record GeneratedToken(string Value, DateTimeOffset ExpiresAt);