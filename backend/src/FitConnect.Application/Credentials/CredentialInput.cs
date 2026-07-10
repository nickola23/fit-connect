using FitConnect.Domain.Enums;

namespace FitConnect.Application.Credentials;

public record CredentialInput(CredentialType Type, string FileUrl, string? IssuedBy);