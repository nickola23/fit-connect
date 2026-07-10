using FitConnect.Application.Common;
using FitConnect.Application.Credentials;
using FitConnect.Domain.Credentials;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Exceptions;
using FitConnect.Domain.Exceptions.Credentials;
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

    public Task<PagedResult<Trainer>> GetAllAsync(int page, int pageSize, RegistrationStatus? statusFilter, CancellationToken cancellationToken = default) =>
        trainerRepository.GetAllAsync(page, pageSize, statusFilter, cancellationToken);

    public async Task<Trainer> CreateAsync(
        string name, string email, string plainTextPassword, string language,
        string? education, string? bio, IReadOnlyList<CredentialInput> credentials, CancellationToken cancellationToken = default)
    {
        if (await trainerRepository.EmailExistsAsync(email, cancellationToken))
        {
            throw new EmailAlreadyRegisteredException(email);
        }

        if (!credentials.Any(c => c.Type is CredentialType.License or CredentialType.Diploma))
        {
            throw new TrainerRequiresCredentialException();
        }

        var trainer = new Trainer(
            Guid.NewGuid(), name, email, passwordHasher.Hash(plainTextPassword), language,
            DateTimeOffset.UtcNow, RegistrationStatus.Pending, education, bio, approvedAt: null);

        var credentialEntities = credentials
            .Select(c => new Credential(Guid.NewGuid(), trainer.Id, c.Type, c.FileUrl, c.IssuedBy, DateOnly.FromDateTime(DateTime.UtcNow)))
            .ToList();

        return await trainerRepository.CreateAsync(trainer, credentialEntities, cancellationToken);
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
    
    public async Task<Trainer> ApproveAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var trainer = await trainerRepository.GetByIdAsync(id, cancellationToken)
                      ?? throw new UserNotFoundException(id);

        trainer.Approve();
        await trainerRepository.UpdateAsync(trainer, cancellationToken);
        return trainer;
    }

    public async Task<Trainer> RejectAsync(Guid id, CancellationToken cancellationToken = default)
    {
        var trainer = await trainerRepository.GetByIdAsync(id, cancellationToken)
                      ?? throw new UserNotFoundException(id);

        trainer.Reject();
        await trainerRepository.UpdateAsync(trainer, cancellationToken);
        return trainer;
    }
}