using FitConnect.Domain.Credentials;
using FitConnect.Domain.Enums;

namespace FitConnect.Api.Contracts.Credentials;

public class CredentialResponse
{
    public required Guid Id { get; init; }
    public required Guid TrainerId { get; init; }
    public required CredentialType Type { get; init; }
    public required string FileUrl { get; init; }
    public string? IssuedBy { get; init; }
    public required DateOnly UploadDate { get; init; }

    public static CredentialResponse FromDomain(Credential credential) => new()
    {
        Id = credential.Id,
        TrainerId = credential.TrainerId,
        Type = credential.Type,
        FileUrl = credential.FileUrl,
        IssuedBy = credential.IssuedBy,
        UploadDate = credential.UploadDate
    };
}