using FitConnect.Domain.Credentials;

namespace FitConnect.Application.Credentials;

public interface ICredentialRepository
{
    Task<Credential?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Credential>> GetForTrainerAsync(Guid trainerId, CancellationToken cancellationToken = default);
    Task<Credential> CreateAsync(Credential credential, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}