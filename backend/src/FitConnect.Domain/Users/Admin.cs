using FitConnect.Domain.Enums;

namespace FitConnect.Domain.Users;

public class Admin : User
{
    public Admin(Guid id, string name, string email, string passwordHash, string language, DateTimeOffset createdAt)
        : base(id, name, email, passwordHash, language, createdAt)
    {
    }

    public override UserRole Role => UserRole.Admin;
}