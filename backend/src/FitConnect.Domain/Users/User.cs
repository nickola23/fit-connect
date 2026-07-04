using FitConnect.Domain.Enums;

namespace FitConnect.Domain.Users;

public abstract class User
{
    public Guid Id { get; }
    public string Name { get; private set; }
    public string Email { get; }
    public string PasswordHash { get; private set; }
    public string Language { get; private set; }
    public DateTimeOffset CreatedAt { get; }

    protected User(Guid id, string name, string email, string passwordHash, string language, DateTimeOffset createdAt)
    {
        Id = id;
        Name = name;
        Email = email;
        PasswordHash = passwordHash;
        Language = language;
        CreatedAt = createdAt;
    }

    public abstract UserRole Role { get; }

    public void UpdateProfile(string name, string language)
    {
        Name = name;
        Language = language;
    }

    public void ChangePasswordHash(string newPasswordHash)
    {
        PasswordHash = newPasswordHash;
    }
}