using System.Security.Claims;
using FitConnect.Application.Trainings;
using FitConnect.Domain.Enums;
using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class TrainingParticipantOrAdminAuthorizationHandler : AuthorizationHandler<TrainingParticipantOrAdminRequirement>
{
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly ITrainingRepository trainingRepository;

    public TrainingParticipantOrAdminAuthorizationHandler(IHttpContextAccessor httpContextAccessor, ITrainingRepository trainingRepository)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.trainingRepository = trainingRepository;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, TrainingParticipantOrAdminRequirement requirement)
    {
        if (context.User.IsInRole(nameof(UserRole.Admin)))
        {
            context.Succeed(requirement);
            return;
        }

        var routeId = httpContextAccessor.HttpContext?.Request.RouteValues["id"]?.ToString();
        if (!Guid.TryParse(routeId, out var trainingId))
        {
            return;
        }

        var participants = await trainingRepository.GetParticipantsAsync(trainingId);
        if (participants is null)
        {
            return;
        }

        var currentUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        var isParticipant = currentUserId is not null &&
                            (string.Equals(currentUserId, participants.TrainerId.ToString(), StringComparison.OrdinalIgnoreCase) ||
                             string.Equals(currentUserId, participants.ClientId.ToString(), StringComparison.OrdinalIgnoreCase));

        if (isParticipant)
        {
            context.Succeed(requirement);
        }
    }
}