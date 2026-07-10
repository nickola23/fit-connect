using FitConnect.Domain.Enums;

namespace FitConnect.Api.Contracts.Credentials;

public class CredentialRequest
{
    public required CredentialType Type { get; init; }
    public required string FileUrl { get; init; }
    public string? IssuedBy { get; init; }
}