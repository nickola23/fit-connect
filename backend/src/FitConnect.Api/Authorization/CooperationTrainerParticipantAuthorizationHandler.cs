using System.Security.Claims;
using FitConnect.Application.Cooperations;
using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class CooperationTrainerParticipantAuthorizationHandler : AuthorizationHandler<CooperationTrainerParticipantRequirement>
{
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly ICooperationRepository cooperationRepository;

    public CooperationTrainerParticipantAuthorizationHandler(IHttpContextAccessor httpContextAccessor, ICooperationRepository cooperationRepository)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.cooperationRepository = cooperationRepository;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, CooperationTrainerParticipantRequirement requirement)
    {
        var routeId = httpContextAccessor.HttpContext?.Request.RouteValues["id"]?.ToString();
        if (!Guid.TryParse(routeId, out var cooperationId))
        {
            return;
        }

        var participants = await cooperationRepository.GetParticipantsAsync(cooperationId);
        if (participants is null)
        {
            return;
        }

        var currentUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId is not null && string.Equals(currentUserId, participants.TrainerId.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
        }
    }
}