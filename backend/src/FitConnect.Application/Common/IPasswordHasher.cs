namespace FitConnect.Application.Common;

public interface IPasswordHasher
{
    string Hash(string plainTextPassword);
    bool Verify(string plainTextPassword, string passwordHash);
}