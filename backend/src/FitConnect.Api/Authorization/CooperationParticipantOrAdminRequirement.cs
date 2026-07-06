using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class CooperationParticipantOrAdminRequirement : IAuthorizationRequirement
{
    // Caller is Admin or is the trainer or client on this cooperation.
}