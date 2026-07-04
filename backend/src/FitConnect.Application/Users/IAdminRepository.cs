using FitConnect.Domain.Users;

namespace FitConnect.Application.Users;

public interface IAdminRepository
{
    Task<Admin?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Admin>> GetAllAsync(CancellationToken cancellationToken = default);
    Task<Admin> CreateAsync(Admin admin, CancellationToken cancellationToken = default);
    Task UpdateAsync(Admin admin, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> EmailExistsAsync(string email, CancellationToken cancellationToken = default);
}