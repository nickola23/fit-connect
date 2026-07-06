using FitConnect.Domain.Cooperations;

namespace FitConnect.Application.Cooperations;

public interface IPricingTierRepository
{
    Task<PricingTier?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
}