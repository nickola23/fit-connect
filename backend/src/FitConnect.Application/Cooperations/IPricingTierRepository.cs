using FitConnect.Domain.Cooperations;

namespace FitConnect.Application.Cooperations;

public interface IPricingTierRepository
{
    Task<PricingTier?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<PricingTier>> GetForTrainerAsync(Guid trainerId, bool activeOnly, CancellationToken cancellationToken = default);
    Task<PricingTier> CreateAsync(PricingTier pricingTier, CancellationToken cancellationToken = default);
    Task UpdateAsync(PricingTier pricingTier, CancellationToken cancellationToken = default);
}