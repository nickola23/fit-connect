using FitConnect.Api.Contracts.PricingTiers;
using FitConnect.Application.Cooperations;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitConnect.Api.Controllers;

[ApiController]
[Route("api/pricing-tiers")]
[Authorize]
public class PricingTiersController : ControllerBase
{
    private readonly PricingTierService pricingTierService;

    public PricingTiersController(PricingTierService pricingTierService)
    {
        this.pricingTierService = pricingTierService;
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<PricingTierResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var tier = await pricingTierService.GetByIdAsync(id, cancellationToken);
        return tier is null ? NotFound() : Ok(PricingTierResponse.FromDomain(tier));
    }

    [HttpPatch("{id:guid}")]
    [Authorize(Policy = "PricingTierOwnerOrAdmin")]
    public async Task<IActionResult> UpdatePrice(Guid id, UpdatePricingTierRequest request, CancellationToken cancellationToken)
    {
        await pricingTierService.UpdatePriceAsync(id, request.MonthlyPrice, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/deactivate")]
    [Authorize(Policy = "PricingTierOwnerOrAdmin")]
    public async Task<IActionResult> Deactivate(Guid id, CancellationToken cancellationToken)
    {
        await pricingTierService.SetActiveAsync(id, active: false, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/activate")]
    [Authorize(Policy = "PricingTierOwnerOrAdmin")]
    public async Task<IActionResult> Activate(Guid id, CancellationToken cancellationToken)
    {
        await pricingTierService.SetActiveAsync(id, active: true, cancellationToken);
        return NoContent();
    }
}