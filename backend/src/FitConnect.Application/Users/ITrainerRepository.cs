using FitConnect.Application.Common;
using FitConnect.Domain.Credentials;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Users;

namespace FitConnect.Application.Users;

public interface ITrainerRepository
{
    Task<Trainer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedResult<Trainer>> GetAllAsync(int page, int pageSize, RegistrationStatus? statusFilter = null, CancellationToken cancellationToken = default);
    Task<Trainer> CreateAsync(Trainer trainer, IReadOnlyList<Credential> credentials, CancellationToken cancellationToken = default);
    Task UpdateAsync(Trainer trainer, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);
}