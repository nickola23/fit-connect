using FitConnect.Api.Contracts.Cooperations;
using FitConnect.Application.Common;
using FitConnect.Application.Cooperations;
using FitConnect.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitConnect.Api.Controllers;

[ApiController]
[Route("api/cooperations")]
[Authorize]
public class CooperationsController : ControllerBase
{
    private readonly CooperationService cooperationService;
    private readonly ICurrentUserAccessor currentUser;

    public CooperationsController(CooperationService cooperationService, ICurrentUserAccessor currentUser)
    {
        this.cooperationService = cooperationService;
        this.currentUser = currentUser;
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Client))]
    public async Task<ActionResult<CooperationResponse>> Request(CreateCooperationRequest request, CancellationToken cancellationToken)
    {
        var command = new RequestCooperationCommand
        {
            TrainerId = request.TrainerId,
            ClientId = currentUser.UserId!.Value,
            PricingTierId = request.PricingTierId,
            IsFreeTrial = request.IsFreeTrial
        };

        var cooperation = await cooperationService.RequestCooperationAsync(command, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = cooperation.Id }, CooperationResponse.FromDomain(cooperation));
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "CooperationParticipantOrAdmin")]
    public async Task<ActionResult<CooperationResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var cooperation = await cooperationService.GetByIdAsync(id, cancellationToken);
        return cooperation is null ? NotFound() : Ok(CooperationResponse.FromDomain(cooperation));
    }

    [HttpPost("{id:guid}/accept")]
    [Authorize(Policy = "CooperationTrainerParticipant")]
    public async Task<ActionResult<CooperationResponse>> Accept(Guid id, CancellationToken cancellationToken)
    {
        var cooperation = await cooperationService.AcceptAsync(id, cancellationToken);
        return Ok(CooperationResponse.FromDomain(cooperation));
    }

    [HttpPost("{id:guid}/reject")]
    [Authorize(Policy = "CooperationTrainerParticipant")]
    public async Task<ActionResult<CooperationResponse>> Reject(Guid id, CancellationToken cancellationToken)
    {
        var cooperation = await cooperationService.RejectAsync(id, cancellationToken);
        return Ok(CooperationResponse.FromDomain(cooperation));
    }

    [HttpPost("{id:guid}/end")]
    [Authorize(Policy = "CooperationParticipantOrAdmin")]
    public async Task<ActionResult<CooperationResponse>> End(Guid id, CancellationToken cancellationToken)
    {
        var cooperation = await cooperationService.EndAsync(id, cancellationToken);
        return Ok(CooperationResponse.FromDomain(cooperation));
    }
}