using System.Security.Claims;
using FitConnect.Application.Cooperations;
using FitConnect.Domain.Enums;
using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class CooperationTrainerParticipantOrAdminAuthorizationHandler : AuthorizationHandler<CooperationTrainerParticipantOrAdminRequirement>
{
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly ICooperationRepository cooperationRepository;

    public CooperationTrainerParticipantOrAdminAuthorizationHandler(IHttpContextAccessor httpContextAccessor, ICooperationRepository cooperationRepository)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.cooperationRepository = cooperationRepository;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, CooperationTrainerParticipantOrAdminRequirement requirement)
    {
        if (context.User.IsInRole(nameof(UserRole.Admin)))
        {
            context.Succeed(requirement);
            return;
        }

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