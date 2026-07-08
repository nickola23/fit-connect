using System.Security.Claims;
using FitConnect.Application.Trainings;
using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class TrainingTrainerOnlyAuthorizationHandler : AuthorizationHandler<TrainingTrainerOnlyRequirement>
{
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly ITrainingRepository trainingRepository;

    public TrainingTrainerOnlyAuthorizationHandler(IHttpContextAccessor httpContextAccessor, ITrainingRepository trainingRepository)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.trainingRepository = trainingRepository;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, TrainingTrainerOnlyRequirement requirement)
    {
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
        if (currentUserId is not null && string.Equals(currentUserId, participants.TrainerId.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
        }
    }
}