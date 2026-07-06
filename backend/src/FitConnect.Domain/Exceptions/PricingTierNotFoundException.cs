namespace FitConnect.Domain.Exceptions;

public class PricingTierNotFoundException : Exception
{
    public PricingTierNotFoundException(Guid pricingTierId)
        : base($"Pricing tier '{pricingTierId}' was not found or does not belong to this trainer.")
    {
    }
}