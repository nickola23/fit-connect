namespace FitConnect.Domain.Exceptions.Credentials;

public class TrainerRequiresCredentialException : Exception
{
    public TrainerRequiresCredentialException()
        : base("At least one valid license or diploma is required to register as a trainer.")
    {
    }
}