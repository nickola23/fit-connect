using FitConnect.Domain.Credentials;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Exceptions.Credentials;

namespace FitConnect.Application.Credentials;

public class CredentialService
{
    private readonly ICredentialRepository credentialRepository;

    public CredentialService(ICredentialRepository credentialRepository)
    {
        this.credentialRepository = credentialRepository;
    }

    public Task<IReadOnlyList<Credential>> GetForTrainerAsync(Guid trainerId, CancellationToken cancellationToken = default) =>
        credentialRepository.GetForTrainerAsync(trainerId, cancellationToken);

    public async Task<Credential> AddAsync(Guid trainerId, CredentialType type, string fileUrl, string? issuedBy, CancellationToken cancellationToken = default)
    {
        var credential = new Credential(Guid.NewGuid(), trainerId, type, fileUrl, issuedBy, DateOnly.FromDateTime(DateTime.UtcNow));
        return await credentialRepository.CreateAsync(credential, cancellationToken);
    }

    public async Task DeleteAsync(Guid credentialId, CancellationToken cancellationToken = default)
    {
        var credential = await credentialRepository.GetByIdAsync(credentialId, cancellationToken)
                         ?? throw new CredentialNotFoundException(credentialId);

        if (credential.CountsAsValidRegistrationProof)
        {
            var remaining = await credentialRepository.GetForTrainerAsync(credential.TrainerId, cancellationToken);
            var otherValidCount = remaining.Count(c => c.Id != credentialId && c.CountsAsValidRegistrationProof);

            if (otherValidCount == 0)
            {
                throw new CannotRemoveLastCredentialException(credential.TrainerId);
            }
        }

        await credentialRepository.DeleteAsync(credentialId, cancellationToken);
    }
}