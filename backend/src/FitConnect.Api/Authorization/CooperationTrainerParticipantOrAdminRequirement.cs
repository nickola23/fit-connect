using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class CooperationTrainerParticipantOrAdminRequirement : IAuthorizationRequirement
{
    // Caller is Admin, or is the trainer on this cooperation — used for recording a payment.
}