using FitConnect.Domain.Enums;

namespace FitConnect.Domain.Credentials;

public class Credential
{
    public Guid Id { get; }
    public Guid TrainerId { get; }
    public CredentialType Type { get; }
    public string FileUrl { get; }
    public string? IssuedBy { get; }
    public DateOnly UploadDate { get; }

    public Credential(Guid id, Guid trainerId, CredentialType type, string fileUrl, string? issuedBy, DateOnly uploadDate)
    {
        Id = id;
        TrainerId = trainerId;
        Type = type;
        FileUrl = fileUrl;
        IssuedBy = issuedBy;
        UploadDate = uploadDate;
    }

    public bool CountsAsValidRegistrationProof => Type is CredentialType.License or CredentialType.Diploma;
}