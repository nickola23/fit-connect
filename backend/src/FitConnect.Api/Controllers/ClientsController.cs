using FitConnect.Api.Contracts.Clients;
using FitConnect.Api.Contracts.Common;
using FitConnect.Application.Users;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitConnect.Api.Controllers;

[ApiController]
[Route("api/clients")]
[Authorize]
public class ClientsController : ControllerBase
{
    private readonly ClientService clientService;

    public ClientsController(ClientService clientService)
    {
        this.clientService = clientService;
    }

    [HttpGet]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<PagedResponse<ClientResponse>>> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await clientService.GetAllAsync(page, pageSize, cancellationToken);
        return Ok(new PagedResponse<ClientResponse>
        {
            Items = result.Items.Select(ToResponse).ToList(),
            TotalCount = result.TotalCount,
            Page = result.Page,
            PageSize = result.PageSize
        });
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "SameUserOrAdmin")]
    public async Task<ActionResult<ClientResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var client = await clientService.GetByIdAsync(id, cancellationToken);
        return client is null ? NotFound() : Ok(ToResponse(client));
    }

    [HttpPatch("{id:guid}")]
    [Authorize(Policy = "SameUserOrAdmin")]
    public async Task<IActionResult> Update(Guid id, UpdateClientRequest request, CancellationToken cancellationToken)
    {
        await clientService.UpdateAsync(id, request.Name, request.Language, request.Goal, request.TrainingLocation, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "SameUserOrAdmin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await clientService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }

    private static ClientResponse ToResponse(Client client) => new()
    {
        Id = client.Id,
        Name = client.Name,
        Email = client.Email,
        Language = client.Language,
        CreatedAt = client.CreatedAt,
        Goal = client.Goal,
        TrainingLocation = client.TrainingLocation,
        FreeTrialUsed = client.FreeTrialUsed
    };
}