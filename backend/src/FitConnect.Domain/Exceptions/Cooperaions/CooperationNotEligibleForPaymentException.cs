namespace FitConnect.Domain.Exceptions.Cooperaions;

public class CooperationNotEligibleForPaymentException : Exception
{
    public CooperationNotEligibleForPaymentException(Guid cooperationId)
        : base($"Cooperation '{cooperationId}' must be accepted or active to record a payment.")
    {
    }
}