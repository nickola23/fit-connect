using System.Security.Claims;
using FitConnect.Application.Trainings;
using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class TrainingExerciseClientOwnerAuthorizationHandler : AuthorizationHandler<TrainingExerciseClientOwnerRequirement>
{
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly ITrainingExerciseRepository trainingExerciseRepository;

    public TrainingExerciseClientOwnerAuthorizationHandler(IHttpContextAccessor httpContextAccessor, ITrainingExerciseRepository trainingExerciseRepository)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.trainingExerciseRepository = trainingExerciseRepository;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, TrainingExerciseClientOwnerRequirement requirement)
    {
        var routeId = httpContextAccessor.HttpContext?.Request.RouteValues["id"]?.ToString();
        if (!Guid.TryParse(routeId, out var trainingExerciseId))
        {
            return;
        }

        var clientId = await trainingExerciseRepository.GetOwningClientIdAsync(trainingExerciseId);
        if (clientId is null)
        {
            return;
        }

        var currentUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId is not null && string.Equals(currentUserId, clientId.Value.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
        }
    }
}