using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class SameUserOrAdminRequirement : IAuthorizationRequirement
{
    // Caller is Admin, or callers id matches the {id} route value.
}