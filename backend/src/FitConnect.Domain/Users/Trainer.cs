using FitConnect.Domain.Enums;
using FitConnect.Domain.Exceptions.Credentials;

namespace FitConnect.Domain.Users;

public class Trainer : User
{
    public RegistrationStatus RegistrationStatus { get; private set; }
    public string? Education { get; private set; }
    public string? Bio { get; private set; }
    public DateTimeOffset? ApprovedAt { get; private set; }

    public Trainer(
        Guid id,
        string name,
        string email,
        string passwordHash,
        string language,
        DateTimeOffset createdAt,
        RegistrationStatus registrationStatus,
        string? education,
        string? bio,
        DateTimeOffset? approvedAt)
        : base(id, name, email, passwordHash, language, createdAt)
    {
        RegistrationStatus = registrationStatus;
        Education = education;
        Bio = bio;
        ApprovedAt = approvedAt;
    }

    public override UserRole Role => UserRole.Trainer;

    public void UpdateQualifications(string? education, string? bio)
    {
        Education = education;
        Bio = bio;
    }

    public void Approve()
    {
        EnsurePending();
        RegistrationStatus = RegistrationStatus.Approved;
        ApprovedAt = DateTimeOffset.UtcNow;
    }

    public void Reject()
    {
        EnsurePending();
        RegistrationStatus = RegistrationStatus.Rejected;
    }

    private void EnsurePending()
    {
        if (RegistrationStatus != RegistrationStatus.Pending)
        {
            throw new TrainerRegistrationAlreadyProcessedException(Id, RegistrationStatus);
        }
    }
}