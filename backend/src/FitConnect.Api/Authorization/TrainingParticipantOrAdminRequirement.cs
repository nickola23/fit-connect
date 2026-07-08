using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class TrainingParticipantOrAdminRequirement : IAuthorizationRequirement
{
    // Caller is Admin, or is the trainer who owns this training.
}