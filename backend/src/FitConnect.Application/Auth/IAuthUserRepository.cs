namespace FitConnect.Application.Auth;

public interface IAuthUserRepository
{
    Task<AuthUserRecord?> FindByEmailAsync(string email, CancellationToken cancellationToken = default);
}