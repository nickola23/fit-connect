using System.Security.Claims;
using FitConnect.Application.Cooperations;
using FitConnect.Domain.Enums;
using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class PricingTierOwnerOrAdminAuthorizationHandler : AuthorizationHandler<PricingTierOwnerOrAdminRequirement>
{
    private readonly IHttpContextAccessor httpContextAccessor;
    private readonly IPricingTierRepository pricingTierRepository;

    public PricingTierOwnerOrAdminAuthorizationHandler(IHttpContextAccessor httpContextAccessor, IPricingTierRepository pricingTierRepository)
    {
        this.httpContextAccessor = httpContextAccessor;
        this.pricingTierRepository = pricingTierRepository;
    }

    protected override async Task HandleRequirementAsync(AuthorizationHandlerContext context, PricingTierOwnerOrAdminRequirement requirement)
    {
        if (context.User.IsInRole(nameof(UserRole.Admin)))
        {
            context.Succeed(requirement);
            return;
        }

        var routeId = httpContextAccessor.HttpContext?.Request.RouteValues["id"]?.ToString();
        if (!Guid.TryParse(routeId, out var pricingTierId))
        {
            return;
        }

        var tier = await pricingTierRepository.GetByIdAsync(pricingTierId);
        if (tier is null)
        {
            return;
        }

        var currentUserId = context.User.FindFirstValue(ClaimTypes.NameIdentifier);
        if (currentUserId is not null && string.Equals(currentUserId, tier.TrainerId.ToString(), StringComparison.OrdinalIgnoreCase))
        {
            context.Succeed(requirement);
        }
    }
}