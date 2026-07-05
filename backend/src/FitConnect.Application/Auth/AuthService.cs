using FitConnect.Application.Common;
using FitConnect.Application.Users;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Exceptions;

namespace FitConnect.Application.Auth;

public class AuthService
{
    private readonly IAuthUserRepository authUserRepository;
    private readonly IPasswordHasher passwordHasher;
    private readonly ITokenGenerator tokenGenerator;
    private readonly ClientService clientService;
    private readonly TrainerService trainerService;

    public AuthService(
        IAuthUserRepository authUserRepository,
        IPasswordHasher passwordHasher,
        ITokenGenerator tokenGenerator,
        ClientService clientService,
        TrainerService trainerService)
    {
        this.authUserRepository = authUserRepository;
        this.passwordHasher = passwordHasher;
        this.tokenGenerator = tokenGenerator;
        this.clientService = clientService;
        this.trainerService = trainerService;
    }

    public async Task<AuthResult> LoginAsync(string email, string password, CancellationToken cancellationToken = default)
    {
        var user = await authUserRepository.FindByEmailAsync(email, cancellationToken)
            ?? throw new InvalidCredentialsException();

        if (!passwordHasher.Verify(password, user.PasswordHash))
        {
            throw new InvalidCredentialsException();
        }

        return BuildAuthResult(user.Id, user.Name, user.Email, user.Role);
    }

    public async Task<AuthResult> RegisterClientAsync(
        string name, string email, string password, string language,
        string? goal, TrainingLocation? trainingLocation, CancellationToken cancellationToken = default)
    {
        var client = await clientService.CreateAsync(name, email, password, language, goal, trainingLocation, cancellationToken);
        return BuildAuthResult(client.Id, client.Name, client.Email, UserRole.Client);
    }

    public async Task<AuthResult> RegisterTrainerAsync(
        string name, string email, string password, string language,
        string? education, string? bio, CancellationToken cancellationToken = default)
    {
        var trainer = await trainerService.CreateAsync(name, email, password, language, education, bio, cancellationToken);
        return BuildAuthResult(trainer.Id, trainer.Name, trainer.Email, UserRole.Trainer);
    }

    private AuthResult BuildAuthResult(Guid userId, string name, string email, UserRole role)
    {
        var token = tokenGenerator.Generate(userId, email, name, role);
        return new AuthResult(token.Value, token.ExpiresAt, userId, name, email, role);
    }
}