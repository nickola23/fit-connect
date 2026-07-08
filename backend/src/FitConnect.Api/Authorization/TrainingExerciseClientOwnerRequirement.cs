using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class TrainingExerciseClientOwnerRequirement : IAuthorizationRequirement
{
    // Caller must be the client who owns this exercise.
}