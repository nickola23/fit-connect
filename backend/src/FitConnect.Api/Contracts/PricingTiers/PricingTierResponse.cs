using FitConnect.Domain.Cooperations;

namespace FitConnect.Api.Contracts.PricingTiers;

public class PricingTierResponse
{
    public required Guid Id { get; init; }
    public required Guid TrainerId { get; init; }
    public required int SessionsPerWeek { get; init; }
    public required decimal MonthlyPrice { get; init; }
    public required bool Active { get; init; }

    public static PricingTierResponse FromDomain(PricingTier tier) => new()
    {
        Id = tier.Id,
        TrainerId = tier.TrainerId,
        SessionsPerWeek = tier.SessionsPerWeek,
        MonthlyPrice = tier.MonthlyPrice,
        Active = tier.Active
    };
}