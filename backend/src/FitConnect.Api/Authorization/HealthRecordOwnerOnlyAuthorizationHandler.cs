using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class HealthRecordOwnerOnlyAuthorizationHandler : AuthorizationHandler<HealthRecordOwnerOnlyRequirement>
{
    private readonly IHttpContextAccessor httpContextAccessor;

    public HealthRecordOwnerOnlyAuthorizationHandler(IHttpContextAccessor httpContextAccessor)
    {
        this.httpContextAccessor = httpContextAccessor;
    }

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, HealthRecordOwnerOnlyRequirement requirement)
    {
        var routeClientId = httpContextAccessor.HttpContext?.Request.RouteValues["clientId"]?.ToString();
        var currentUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (routeClientId is not null && currentUserId is not null &&
            string.Equals(routeClientId, currentUserId, StringComparison.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}