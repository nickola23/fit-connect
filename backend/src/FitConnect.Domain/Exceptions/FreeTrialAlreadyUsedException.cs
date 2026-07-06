namespace FitConnect.Domain.Exceptions;

public class FreeTrialAlreadyUsedException : Exception
{
    public FreeTrialAlreadyUsedException(Guid clientId)
        : base($"Client '{clientId}' has already used their free trial.")
    {
    }
}