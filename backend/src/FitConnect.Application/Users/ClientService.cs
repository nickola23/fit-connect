using FitConnect.Application.Common;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Exceptions;
using FitConnect.Domain.Users;

namespace FitConnect.Application.Users;

public class ClientService
{
    private readonly IClientRepository clientRepository;
    private readonly IPasswordHasher passwordHasher;

    public ClientService(IClientRepository clientRepository, IPasswordHasher passwordHasher)
    {
        this.clientRepository = clientRepository;
        this.passwordHasher = passwordHasher;
    }

    public Task<Client?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        clientRepository.GetByIdAsync(id, cancellationToken);

    public Task<PagedResult<Client>> GetAllAsync(int page, int pageSize, CancellationToken cancellationToken = default) =>
        clientRepository.GetAllAsync(page, pageSize, cancellationToken);

    public async Task<Client> CreateAsync(
        string name, string email, string plainTextPassword, string language,
        string? goal, TrainingLocation? trainingLocation, CancellationToken cancellationToken = default)
    {
        if (await clientRepository.EmailExistsAsync(email, cancellationToken))
        {
            throw new EmailAlreadyRegisteredException(email);
        }

        var client = new Client(
            Guid.NewGuid(), name, email, passwordHasher.Hash(plainTextPassword), language,
            DateTimeOffset.UtcNow, goal, trainingLocation, freeTrialUsed: false);

        return await clientRepository.CreateAsync(client, cancellationToken);
    }

    public async Task UpdateAsync(Guid id, string name, string language, string? goal, TrainingLocation? trainingLocation, CancellationToken cancellationToken = default)
    {
        var client = await clientRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new UserNotFoundException(id);

        client.UpdateProfile(name, language);
        client.UpdateGoalAndLocation(goal, trainingLocation);
        await clientRepository.UpdateAsync(client, cancellationToken);
    }

    public Task DeleteAsync(Guid id, CancellationToken cancellationToken = default) =>
        clientRepository.DeleteAsync(id, cancellationToken);
}