using System.Security.Claims;
using FitConnect.Application.Cooperations;
using FitConnect.Domain.Enums;
using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class HealthRecordAccessAuthorizationHandler : AuthorizationHandler<HealthRecordAccessRequirement>
{
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly ICooperationRepository cooperationRepository;

    public HealthRecordAccessAuthorizationHandler(IHttpContextAccessor httpContextAccessor, ICooperationRepository cooperationRepository)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.cooperationRepository = cooperationRepository;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, HealthRecordAccessRequirement requirement)
    {
        var routeClientId = httpContextAccessor.HttpContext?.Request.RouteValues["clientId"]?.ToString();
        if (!Guid.TryParse(routeClientId, out var clientId))
        {
            return;
        }

        var currentUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (currentUserId is not null && string.Equals(currentUserId, clientId.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
            return;
        }

        if (context.User.IsInRole(nameof(UserRole.Trainer)) &&
            Guid.TryParse(currentUserId, out var trainerId) &&
            await cooperationRepository.HasAcceptedOrActiveCooperationBetweenAsync(trainerId, clientId))
        {
            context.Succeed(requirement);
        }
    }
}