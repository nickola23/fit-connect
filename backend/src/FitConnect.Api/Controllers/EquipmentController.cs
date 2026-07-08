using FitConnect.Api.Contracts.Equipment;
using FitConnect.Application.Equipment;
using FitConnect.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitConnect.Api.Controllers;

[ApiController]
[Route("api/equipment")]
[Authorize]
public class EquipmentController : ControllerBase
{
    private readonly EquipmentService equipmentService;

    public EquipmentController(EquipmentService equipmentService)
    {
        this.equipmentService = equipmentService;
    }

    [HttpGet]
    public async Task<ActionResult<IReadOnlyList<EquipmentResponse>>> GetAll(CancellationToken cancellationToken)
    {
        var equipment = await equipmentService.GetAllAsync(cancellationToken);
        return Ok(equipment.Select(EquipmentResponse.FromDomain));
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<EquipmentResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var equipment = await equipmentService.GetByIdAsync(id, cancellationToken);
        return equipment is null ? NotFound() : Ok(EquipmentResponse.FromDomain(equipment));
    }

    [HttpPost]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<EquipmentResponse>> Create(CreateEquipmentRequest request, CancellationToken cancellationToken)
    {
        var equipment = await equipmentService.CreateAsync(request.Name, cancellationToken);
        return CreatedAtAction(nameof(GetById), new { id = equipment.Id }, EquipmentResponse.FromDomain(equipment));
    }

    [HttpPatch("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Update(Guid id, UpdateEquipmentRequest request, CancellationToken cancellationToken)
    {
        await equipmentService.UpdateAsync(id, request.Name, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await equipmentService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
}