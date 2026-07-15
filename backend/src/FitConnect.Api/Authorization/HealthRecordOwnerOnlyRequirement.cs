using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class HealthRecordOwnerOnlyRequirement : IAuthorizationRequirement
{
    // Writing is the client's own action only. No trainer, no admin.
}