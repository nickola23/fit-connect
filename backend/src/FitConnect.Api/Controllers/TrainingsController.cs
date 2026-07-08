using FitConnect.Api.Contracts.Trainings;
using FitConnect.Application.Common;
using FitConnect.Application.Trainings;
using FitConnect.Domain.Enums;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitConnect.Api.Controllers;


[ApiController]
[Route("api/trainings")]
[Authorize]
public class TrainingsController : ControllerBase
{
    private readonly TrainingService trainingService;
    private readonly TrainingExerciseService trainingExerciseService;
    private readonly TrainingReviewService trainingReviewService;
    private readonly ICurrentUserAccessor currentUser;

    public TrainingsController(
        TrainingService trainingService,
        TrainingExerciseService trainingExerciseService,
        TrainingReviewService trainingReviewService,
        ICurrentUserAccessor currentUser)
    {
        this.trainingService = trainingService;
        this.trainingExerciseService = trainingExerciseService;
        this.trainingReviewService = trainingReviewService;
        this.currentUser = currentUser;
    }

    [HttpGet("{id:guid}")]
    [Authorize(Policy = "TrainingParticipantOrAdmin")]
    public async Task<ActionResult<TrainingResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var training = await trainingService.GetByIdAsync(id, cancellationToken);
        return training is null ? NotFound() : Ok(TrainingResponse.FromDomain(training));
    }

    [HttpGet("{id:guid}/exercises")]
    [Authorize(Policy = "TrainingParticipantOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<TrainingExerciseResponse>>> GetExercises(Guid id, CancellationToken cancellationToken)
    {
        var exercises = await trainingExerciseService.GetForTrainingAsync(id, cancellationToken);
        return Ok(exercises.Select(TrainingExerciseResponse.FromDomain));
    }

    [HttpPost("{id:guid}/complete")]
    [Authorize(Policy = "TrainingTrainerOrAdmin")]
    public async Task<ActionResult<TrainingResponse>> Complete(Guid id, CancellationToken cancellationToken)
    {
        var training = await trainingService.CompleteAsync(id, cancellationToken);
        return Ok(TrainingResponse.FromDomain(training));
    }

    [HttpPost("{id:guid}/missed")]
    [Authorize(Policy = "TrainingTrainerOrAdmin")]
    public async Task<ActionResult<TrainingResponse>> MarkMissed(Guid id, CancellationToken cancellationToken)
    {
        var training = await trainingService.MarkMissedAsync(id, cancellationToken);
        return Ok(TrainingResponse.FromDomain(training));
    }

    [HttpGet("{id:guid}/review")]
    [Authorize(Roles = nameof(UserRole.Trainer))]
    public async Task<ActionResult<TrainingReviewResponse>> GetReview(Guid id, CancellationToken cancellationToken)
    {
        var review = await trainingReviewService.GetByTrainingIdAsync(id, cancellationToken);
        return review is null ? NotFound() : Ok(TrainingReviewResponse.FromDomain(review));
    }

    [HttpPost("{id:guid}/review")]
    [Authorize(Policy = "TrainingTrainerOnly")]
    public async Task<ActionResult<TrainingReviewResponse>> CreateReview(Guid id, CreateTrainingReviewRequest request, CancellationToken cancellationToken)
    {
        var review = await trainingReviewService.CreateAsync(id, currentUser.UserId!.Value, request.Rating, request.Comment, cancellationToken);
        return CreatedAtAction(nameof(GetReview), new { id }, TrainingReviewResponse.FromDomain(review));
    }
}