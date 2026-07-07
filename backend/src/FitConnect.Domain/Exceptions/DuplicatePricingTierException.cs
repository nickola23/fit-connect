namespace FitConnect.Domain.Exceptions;

public class DuplicatePricingTierException : Exception
{
    public DuplicatePricingTierException(Guid trainerId, int sessionsPerWeek)
        : base($"Trainer '{trainerId}' already has a pricing tier for {sessionsPerWeek} sessions/week.")
    {
    }
}