namespace FitConnect.Domain.Exceptions.Credentials;

public class CredentialNotFoundException : Exception
{
    public CredentialNotFoundException(Guid credentialId)
        : base($"Credential with id '{credentialId}' was not found.")
    {
    }
}