using FitConnect.Api.Contracts.Trainings;
using FitConnect.Application.Trainings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitConnect.Api.Controllers;

[ApiController]
[Route("api/training-exercises")]
[Authorize]
public class TrainingExercisesController : ControllerBase
{
    private readonly TrainingExerciseService trainingExerciseService;

    public TrainingExercisesController(TrainingExerciseService trainingExerciseService)
    {
        this.trainingExerciseService = trainingExerciseService;
    }

    [HttpPatch("{id:guid}/complete")]
    [Authorize(Policy = "TrainingExerciseClientOwner")]
    public async Task<IActionResult> MarkDone(Guid id, MarkTrainingExerciseDoneRequest request, CancellationToken cancellationToken)
    {
        await trainingExerciseService.MarkDoneAsync(id, request.DifficultyRating, request.Comment, cancellationToken);
        return NoContent();
    }
}