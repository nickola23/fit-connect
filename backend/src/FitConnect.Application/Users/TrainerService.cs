using FitConnect.Application.Common;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Exceptions;
using FitConnect.Domain.Users;

namespace FitConnect.Application.Users;

public class TrainerService
{
    private readonly ITrainerRepository trainerRepository;
    private readonly IPasswordHasher passwordHasher;

    public TrainerService(ITrainerRepository trainerRepository, IPasswordHasher passwordHasher)
    {
        this.trainerRepository = trainerRepository;
        this.passwordHasher = passwordHasher;
    }

    public Task<Trainer?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        trainerRepository.GetByIdAsync(id, cancellationToken);

    public Task<PagedResult<Trainer>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken = default) =>
        trainerRepository.GetAllAsync(page, pageSize, cancellationToken);

    public async Task<Trainer> CreateAsync(
        string name, string email, string plainTextPassword, string language,
        string? education, string? bio, CancellationToken cancellationToken = default)
    {
        if (await trainerRepository.EmailExistsAsync(email, cancellationToken))
        {
            throw new EmailAlreadyRegisteredException(email);
        }

        var trainer = new Trainer(
            Guid.NewGuid(), name, email, passwordHasher.Hash(plainTextPassword), language,
            DateTimeOffset.UtcNow, RegistrationStatus.Pending, education, bio, approvedAt: null);

        return await trainerRepository.CreateAsync(trainer, cancellationToken);
    }

    public async Task UpdateAsync(Guid id, string name, string language, string? education, string? bio, CancellationToken cancellationToken = default)
    {
        var trainer = await trainerRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new UserNotFoundException(id);

        trainer.UpdateProfile(name, language);
        trainer.UpdateQualifications(education, bio);
        await trainerRepository.UpdateAsync(trainer, cancellationToken);
    }

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default) =>
        trainerRepository.DeleteAsync(id, cancellationToken);
}