using FitConnect.Application.Users;
using FitConnect.Domain.Cooperations;
using FitConnect.Domain.Exceptions;

namespace FitConnect.Application.Cooperations;

public class PricingTierService
{
    private readonly IPricingTierRepository pricingTierRepository;
    private readonly ITrainerRepository trainerRepository;

    public PricingTierService(IPricingTierRepository pricingTierRepository, ITrainerRepository trainerRepository)
    {
        this.pricingTierRepository = pricingTierRepository;
        this.trainerRepository = trainerRepository;
    }

    public Task<PricingTier?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        pricingTierRepository.GetByIdAsync(id, cancellationToken);

    public Task<IReadOnlyList<PricingTier>> GetForTrainerAsync(Guid trainerId, bool activeOnly, CancellationToken cancellationToken = default) =>
        pricingTierRepository.GetForTrainerAsync(trainerId, activeOnly, cancellationToken);

    public async Task<PricingTier> CreateAsync(Guid trainerId, int sessionsPerWeek, decimal monthlyPrice, CancellationToken cancellationToken = default)
    {
        var trainer = await trainerRepository.GetByIdAsync(trainerId, cancellationToken);
        if (trainer == null) throw new UserNotFoundException(trainerId);

        var pricingTier = new PricingTier(Guid.NewGuid(), trainerId, sessionsPerWeek, monthlyPrice, active: true);
        return await pricingTierRepository.CreateAsync(pricingTier, cancellationToken);
    }

    public async Task UpdatePriceAsync(Guid id, decimal monthlyPrice, CancellationToken cancellationToken = default)
    {
        var tier = await pricingTierRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new PricingTierNotFoundException(id);

        tier.UpdateMonthlyPrice(monthlyPrice);
        await pricingTierRepository.UpdateAsync(tier, cancellationToken);
    }

    public async Task SetActiveAsync(Guid id, bool active, CancellationToken cancellationToken = default)
    {
        var tier = await pricingTierRepository.GetByIdAsync(id, cancellationToken)
            ?? throw new PricingTierNotFoundException(id);

        if (active)
        {
            tier.Activate();
        }
        else
        {
            tier.Deactivate();
        }

        await pricingTierRepository.UpdateAsync(tier, cancellationToken);
    }
}