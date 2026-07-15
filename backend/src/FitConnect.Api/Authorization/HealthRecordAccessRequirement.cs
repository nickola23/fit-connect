using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class HealthRecordAccessRequirement : IAuthorizationRequirement
{
    // Readable only by the owning client, or their trainer in
    // Accepted/Active cooperation. Deliberately no admin path.
}