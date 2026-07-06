namespace FitConnect.Domain.Exceptions;

public class CooperationAlreadyActiveException : Exception
{
    public CooperationAlreadyActiveException(Guid clientId)
        : base($"Client '{clientId}' already has an accepted or active cooperation.")
    {
    }
}