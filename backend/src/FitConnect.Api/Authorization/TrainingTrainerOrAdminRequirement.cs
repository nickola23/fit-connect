using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class TrainingTrainerOrAdminRequirement : IAuthorizationRequirement
{
    // Caller is Admin, or is the trainer who owns this training.
}