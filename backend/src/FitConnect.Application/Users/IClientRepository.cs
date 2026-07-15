using FitConnect.Application.Common;
using FitConnect.Domain.Users;

namespace FitConnect.Application.Users;

public interface IClientRepository
{
    Task<Client?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<PagedResult<Client>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken = default);
    Task<Client> CreateAsync(Client client, CancellationToken cancellationToken = default);
    Task UpdateAsync(Client client, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Client>> GetByIdsAsync(IReadOnlyList<Guid> ids, CancellationToken cancellationToken = default);
}