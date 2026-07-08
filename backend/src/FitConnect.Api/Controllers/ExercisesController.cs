using FitConnect.Api.Contracts.Equipment;
using FitConnect.Api.Contracts.Exercises;
using FitConnect.Application.Equipment;
using FitConnect.Application.Exercises;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitConnect.Api.Controllers;

[ApiController]
[Route("api/exercises")]
[Authorize]
public class ExercisesController : ControllerBase
{
    private readonly ExerciseService exerciseService;
    private readonly ExerciseEquipmentService exerciseEquipmentService;

    public ExercisesController(ExerciseService exerciseService, ExerciseEquipmentService exerciseEquipmentService)
    {
        this.exerciseService = exerciseService;
        this.exerciseEquipmentService = exerciseEquipmentService;
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "ExerciseOwnerOrAdmin")]
    public async Task<ActionResult<ExerciseResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var exercise = await exerciseService.GetByIdAsync(id, cancellationToken);
        return exercise is null ? NotFound() : Ok(ExerciseResponse.FromDomain(exercise));
    }

    [HttpPatch("{id:guid}")]
    [Authorize(Policy = "ExerciseOwnerOrAdmin")]
    public async Task<IActionResult> Update(Guid id, UpdateExerciseRequest request, CancellationToken cancellationToken)
    {
        await exerciseService.UpdateAsync(id, request.Name, request.DefaultReps, request.DefaultSets, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/demo-video")]
    [Authorize(Policy = "ExerciseOwnerOrAdmin")]
    public async Task<IActionResult> RecordDemoVideo(Guid id, RecordDemoVideoRequest request, CancellationToken cancellationToken)
    {
        await exerciseService.RecordDemoVideoAsync(id, request.Url, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "ExerciseOwnerOrAdmin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await exerciseService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
    
    [HttpGet("{id:guid}/equipment")]
    [Authorize(Policy = "ExerciseOwnerOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<EquipmentResponse>>> GetEquipment(Guid id, CancellationToken cancellationToken)
    {
        var equipment = await exerciseEquipmentService.GetForExerciseAsync(id, cancellationToken);
        return Ok(equipment.Select(EquipmentResponse.FromDomain));
    }

    [HttpPost("{id:guid}/equipment/{equipmentId:guid}")]
    [Authorize(Policy = "ExerciseOwnerOrAdmin")]
    public async Task<IActionResult> AddEquipment(Guid id, Guid equipmentId, CancellationToken cancellationToken)
    {
        await exerciseEquipmentService.AddAsync(id, equipmentId, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}/equipment/{equipmentId:guid}")]
    [Authorize(Policy = "ExerciseOwnerOrAdmin")]
    public async Task<IActionResult> RemoveEquipment(Guid id, Guid equipmentId, CancellationToken cancellationToken)
    {
        await exerciseEquipmentService.RemoveAsync(id, equipmentId, cancellationToken);
        return NoContent();
    }
}