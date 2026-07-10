namespace FitConnect.Domain.Exceptions.Reviews;

public class ClientHasNotCooperatedWithTrainerException : Exception
{
    public ClientHasNotCooperatedWithTrainerException(Guid clientId, Guid trainerId)
        : base($"Client '{clientId}' must have had a cooperation with trainer '{trainerId}' before leaving a review.")
    {
    }
}