using FitConnect.Application.Users;
using FitConnect.Domain.Cooperations;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Exceptions;
using FitConnect.Domain.Exceptions.Cooperaions;

namespace FitConnect.Application.Cooperations;

public class CooperationService
{
    private readonly ICooperationRepository cooperationRepository;
    private readonly IPricingTierRepository pricingTierRepository;
    private readonly ITrainerRepository trainerRepository;
    private readonly IClientRepository clientRepository;

    public CooperationService(
        ICooperationRepository cooperationRepository,
        IPricingTierRepository pricingTierRepository,
        ITrainerRepository trainerRepository,
        IClientRepository clientRepository)
    {
        this.cooperationRepository = cooperationRepository;
        this.pricingTierRepository = pricingTierRepository;
        this.trainerRepository = trainerRepository;
        this.clientRepository = clientRepository;
    }

    public Task<Cooperation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        cooperationRepository.GetByIdAsync(id, cancellationToken);

    public Task<IReadOnlyList<Cooperation>> GetForClientAsync(Guid clientId, CancellationToken cancellationToken = default) =>
        cooperationRepository.GetForClientAsync(clientId, cancellationToken);

    public Task<IReadOnlyList<Cooperation>> GetForTrainerAsync(Guid trainerId, CooperationStatus? statusFilter, CancellationToken cancellationToken = default) =>
        cooperationRepository.GetForTrainerAsync(trainerId, statusFilter, cancellationToken);

    public async Task<Cooperation> RequestCooperationAsync(RequestCooperationCommand command, CancellationToken cancellationToken = default)
    {
        var trainer = await trainerRepository.GetByIdAsync(command.TrainerId, cancellationToken)
            ?? throw new UserNotFoundException(command.TrainerId);

        if (trainer.RegistrationStatus != RegistrationStatus.Approved)
        {
            throw new TrainerNotApprovedException(command.TrainerId);
        }

        var client = await clientRepository.GetByIdAsync(command.ClientId, cancellationToken)
            ?? throw new UserNotFoundException(command.ClientId);

        if (await cooperationRepository.HasAcceptedOrActiveCooperationAsync(command.ClientId, cancellationToken))
        {
            throw new CooperationAlreadyActiveException(command.ClientId);
        }

        Guid? pricingTierId = null;

        if (command.IsFreeTrial)
        {
            if (client.FreeTrialUsed)
            {
                throw new FreeTrialAlreadyUsedException(command.ClientId);
            }
        }
        else
        {
            var tier = await pricingTierRepository.GetByIdAsync(command.PricingTierId!.Value, cancellationToken);
            if (tier is null || tier.TrainerId != command.TrainerId || !tier.Active)
            {
                throw new PricingTierNotFoundException(command.PricingTierId!.Value);
            }

            pricingTierId = tier.Id;
        }

        var cooperation = new Cooperation(
            Guid.NewGuid(), command.TrainerId, command.ClientId, pricingTierId,
            CooperationStatus.Pending, DateTimeOffset.UtcNow, startDate: null, endDate: null, command.IsFreeTrial);

        var created = await cooperationRepository.CreateAsync(cooperation, cancellationToken);

        if (command.IsFreeTrial)
        {
            client.MarkFreeTrialUsed();
            await clientRepository.UpdateAsync(client, cancellationToken);
        }

        return created;
    }

    public async Task<Cooperation> AcceptAsync(Guid cooperationId, CancellationToken cancellationToken = default)
    {
        var cooperation = await cooperationRepository.GetByIdAsync(cooperationId, cancellationToken)
            ?? throw new CooperationNotFoundException(cooperationId);

        cooperation.Accept();
        await cooperationRepository.UpdateAsync(cooperation, cancellationToken);
        return cooperation;
    }

    public async Task<Cooperation> RejectAsync(Guid cooperationId, CancellationToken cancellationToken = default)
    {
        var cooperation = await cooperationRepository.GetByIdAsync(cooperationId, cancellationToken)
            ?? throw new CooperationNotFoundException(cooperationId);

        cooperation.Reject();
        await cooperationRepository.UpdateAsync(cooperation, cancellationToken);
        return cooperation;
    }

    public async Task<Cooperation> EndAsync(Guid cooperationId, CancellationToken cancellationToken = default)
    {
        var cooperation = await cooperationRepository.GetByIdAsync(cooperationId, cancellationToken)
            ?? throw new CooperationNotFoundException(cooperationId);

        cooperation.End();
        await cooperationRepository.UpdateAsync(cooperation, cancellationToken);
        return cooperation;
    }
}