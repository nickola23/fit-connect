using Microsoft.AspNetCore.Authorization;

namespace FitConnect.Api.Authorization;

public class PricingTierOwnerOrAdminRequirement : IAuthorizationRequirement
{
    // Caller is Admin, or is the trainer who owns this pricing tier.
}