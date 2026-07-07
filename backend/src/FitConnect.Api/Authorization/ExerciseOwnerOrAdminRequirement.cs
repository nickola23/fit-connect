using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class ExerciseOwnerOrAdminRequirement : IAuthorizationRequirement
{
    // Caller is Admin, or is the trainer who owns this exercise.
}