namespace FitConnect.Api.Contracts.PricingTiers;

public class UpdatePricingTierRequest
{
    public required decimal MonthlyPrice { get; init; }
}