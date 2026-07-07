using FitConnect.Api.Contracts.Exercises;
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

    public ExercisesController(ExerciseService exerciseService)
    {
        this.exerciseService = exerciseService;
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
}