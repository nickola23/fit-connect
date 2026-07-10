using FitConnect.Api.Contracts.Auth;
using FitConnect.Api.Contracts.Clients;
using FitConnect.Api.Contracts.Trainers;
using FitConnect.Application.Auth;
using FitConnect.Application.Credentials;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitConnect.Api.Controllers;

[ApiController]
[Route("api/auth")]
[AllowAnonymous]
public class AuthController : ControllerBase
{
    private readonly AuthService authService;

    public AuthController(AuthService authService)
    {
        this.authService = authService;
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request, CancellationToken cancellationToken)
    {
        var result = await authService.LoginAsync(request.Email, request.Password, cancellationToken);
        return Ok(ToResponse(result));
    }

    [HttpPost("register/client")]
    public async Task<ActionResult<AuthResponse>> RegisterClient(CreateClientRequest request, CancellationToken cancellationToken)
    {
        var result = await authService.RegisterClientAsync(
            request.Name, request.Email, request.Password, request.Language, request.Goal, request.TrainingLocation, cancellationToken);
        return Ok(ToResponse(result));
    }

    [HttpPost("register/trainer")]
    public async Task<ActionResult<AuthResponse>> RegisterTrainer(CreateTrainerRequest request, CancellationToken cancellationToken)
    {
        var credentials = request.Credentials
            .Select(c => new CredentialInput(c.Type, c.FileUrl, c.IssuedBy))
            .ToList();

        var result = await authService.RegisterTrainerAsync(
            request.Name, request.Email, request.Password, request.Language, request.Education, request.Bio, credentials, cancellationToken);
        return Ok(ToResponse(result));
    }

    private static AuthResponse ToResponse(AuthResult result) => new()
    {
        Token = result.Token,
        ExpiresAt = result.ExpiresAt,
        User = new AuthenticatedUser
        {
            Id = result.UserId,
            Name = result.Name,
            Email = result.Email,
            Role = result.Role.ToString()
        }
    };
}