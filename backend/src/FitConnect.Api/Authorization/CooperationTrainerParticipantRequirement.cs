using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class CooperationTrainerParticipantRequirement : IAuthorizationRequirement
{
    // Caller must be the trainer on this specific cooperation
}