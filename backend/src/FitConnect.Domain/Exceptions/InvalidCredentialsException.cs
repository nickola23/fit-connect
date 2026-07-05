namespace FitConnect.Domain.Exceptions;

public class InvalidCredentialsException : Exception
{
    public InvalidCredentialsException()
        : base("Invalid email or password.")
    {
        // Intentionally generic — never reveal whether the email or the password was wrong.
    }
}