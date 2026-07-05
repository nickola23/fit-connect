using System.Security.Claims;
using FitConnect.Domain.Enums;
using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class SameUserOrAdminAuthorizationHandler : AuthorizationHandler<SameUserOrAdminRequirement>
{
    private readonly IHttpContextAccessor httpContextAccessor;

    public SameUserOrAdminAuthorizationHandler(IHttpContextAccessor httpContextAccessor)
    {
        this.httpContextAccessor = httpContextAccessor;
    }

    protected override Task HandleRequirementAsync(AuthorizationHandlerContext context, SameUserOrAdminRequirement requirement)
    {
        if (context.User.IsInRole(nameof(UserRole.Admin)))
        {
            context.Succeed(requirement);
            return Task.CompletedTask;
        }

        var routeId = httpContextAccessor.HttpContext?.Request.RouteValues["id"]?.ToString();
        var currentUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);

        if (routeId is not null && currentUserId is not null &&
            string.Equals(routeId, currentUserId, StringComparison.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
        }

        return Task.CompletedTask;
    }
}