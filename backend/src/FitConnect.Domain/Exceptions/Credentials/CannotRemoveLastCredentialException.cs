namespace FitConnect.Domain.Exceptions.Credentials;

public class CannotRemoveLastCredentialException : Exception
{
    public CannotRemoveLastCredentialException(Guid trainerId)
        : base($"Trainer '{trainerId}' must keep at least one valid license or diploma on file.")
    {
    }
}