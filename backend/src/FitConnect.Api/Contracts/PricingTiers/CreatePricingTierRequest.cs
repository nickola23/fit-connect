namespace FitConnect.Api.Contracts.PricingTiers;

public class CreatePricingTierRequest
{
    public required int SessionsPerWeek { get; init; }
    public required decimal MonthlyPrice { get; init; }
}