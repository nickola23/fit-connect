using System.Security.Claims;
using FitConnect.Application.Exercises;
using FitConnect.Domain.Enums;
using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class ExerciseOwnerOrAdminAuthorizationHandler : AuthorizationHandler<ExerciseOwnerOrAdminRequirement>
{
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly IExerciseRepository exerciseRepository;

    public ExerciseOwnerOrAdminAuthorizationHandler(IHttpContextAccessor httpContextAccessor, IExerciseRepository exerciseRepository)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.exerciseRepository = exerciseRepository;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, ExerciseOwnerOrAdminRequirement requirement)
    {
        if (context.User.IsInRole(nameof(UserRole.Admin)))
        {
            context.Succeed(requirement);
            return;
        }

        var routeId = httpContextAccessor.HttpContext?.Request.RouteValues["id"]?.ToString();
        if (!Guid.TryParse(routeId, out var exerciseId))
        {
            return;
        }

        var exercise = await exerciseRepository.GetByIdAsync(exerciseId);
        if (exercise is null)
        {
            return;
        }

        var currentUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId is not null && string.Equals(currentUserId, exercise.TrainerId.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
        }
    }
}