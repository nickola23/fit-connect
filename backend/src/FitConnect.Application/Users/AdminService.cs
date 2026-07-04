using FitConnect.Application.Common;
using FitConnect.Domain.Exceptions;
using FitConnect.Domain.Users;

namespace FitConnect.Application.Users;

public class AdminService
{
    private readonly IAdminRepository adminRepository;
    private readonly IPasswordHasher passwordHasher;

    public AdminService(IAdminRepository adminRepository, IPasswordHasher passwordHasher)
    {
        this.adminRepository = adminRepository;
        this.passwordHasher = passwordHasher;
    }

    public Task<Admin?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        adminRepository.GetByIdAsync(id, cancellationToken);

    public Task<IReadOnlyList<Admin>> GetAllAsync(CancellationToken cancellationToken = default) =>
        adminRepository.GetAllAsync(cancellationToken);

    public async Task<Admin> CreateAsync(string name, string email, string plainTextPassword, string language, CancellationToken cancellationToken = default)
    {
        if (await adminRepository.EmailExistsAsync(email, cancellationToken))
        {
            throw new EmailAlreadyRegisteredException(email);
        }

        var admin = new Admin(Guid.NewGuid(), name, email, passwordHasher.Hash(plainTextPassword), language, DateTimeOffset.UtcNow);
        return await adminRepository.CreateAsync(admin, cancellationToken);
    }

    public async Task UpdateAsync(Guid id, string name, string language, CancellationToken cancellationToken = default)
    {
        var admin = await adminRepository.GetByIdAsync(id, cancellationToken)
                    ?? throw new UserNotFoundException(id);

        admin.UpdateProfile(name, language);
        await adminRepository.UpdateAsync(admin, cancellationToken);
    }

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default) =>
        adminRepository.DeleteAsync(id, cancellationToken);
}