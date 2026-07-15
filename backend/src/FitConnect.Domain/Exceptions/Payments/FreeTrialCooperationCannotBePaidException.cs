namespace FitConnect.Domain.Exceptions.Payments;

public class FreeTrialCooperationCannotBePaidException : Exception
{
    public FreeTrialCooperationCannotBePaidException(Guid cooperationId)
        : base($"Cooperation '{cooperationId}' is a free trial and cannot have a payment recorded against it.")
    {
    }
}