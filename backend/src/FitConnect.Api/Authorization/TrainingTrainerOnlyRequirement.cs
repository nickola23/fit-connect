using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class TrainingTrainerOnlyRequirement : IAuthorizationRequirement
{
    // Caller must be the trainer on this specific training.
}