using FitConnect.Api.Contracts.Common;
using FitConnect.Api.Contracts.Cooperations;
using FitConnect.Api.Contracts.Credentials;
using FitConnect.Api.Contracts.Exercises;
using FitConnect.Api.Contracts.PricingTiers;
using FitConnect.Api.Contracts.TrainerReviews;
using FitConnect.Api.Contracts.Trainers;
using FitConnect.Application.Common;
using FitConnect.Application.Cooperations;
using FitConnect.Application.Credentials;
using FitConnect.Application.Exercises;
using FitConnect.Application.Reviews;
using FitConnect.Application.Users;
using FitConnect.Domain.Cooperations;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Reviews;
using FitConnect.Domain.Users;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitConnect.Api.Controllers;

[ApiController]
[Route("api/trainers")]
[Authorize]
public class TrainersController : ControllerBase
{
    private readonly TrainerService trainerService;
    private readonly CooperationService cooperationService;
    private readonly PricingTierService pricingTierService;
    private readonly ExerciseService exerciseService;
    private readonly ICurrentUserAccessor currentUser;
    private readonly CredentialService credentialService;
    private readonly TrainerReviewService trainerReviewService;

    public TrainersController(
        TrainerService trainerService,
        CooperationService cooperationService,
        PricingTierService pricingTierService,
        ExerciseService exerciseService,
        ICurrentUserAccessor currentUser,
        CredentialService credentialService,
        TrainerReviewService trainerReviewService)
    {
        this.trainerService = trainerService;
        this.cooperationService = cooperationService;
        this.pricingTierService = pricingTierService;
        this.exerciseService = exerciseService;
        this.currentUser = currentUser;
        this.credentialService = credentialService;
        this.trainerReviewService = trainerReviewService;
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<TrainerResponse>>> GetAll(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 20,
        [FromQuery] string? registrationStatus = null,
        [FromQuery] string sortBy = "Name",
        [FromQuery] string? sortDirection = null,
        CancellationToken cancellationToken = default)
    {
        RegistrationStatus? filter;

        if (currentUser.Role != UserRole.Admin)
        {
            filter = RegistrationStatus.Approved;
        }
        else if (string.IsNullOrWhiteSpace(registrationStatus))
        {
            filter = null;
        }
        else if (Enum.TryParse<RegistrationStatus>(registrationStatus, ignoreCase: true, out var parsedStatus))
        {
            filter = parsedStatus;
        }
        else
        {
            return BadRequest($"Unknown registrationStatus '{registrationStatus}'.");
        }

        if (!Enum.TryParse<TrainerSortBy>(sortBy, ignoreCase: true, out var parsedSortBy))
        {
            return BadRequest($"Unknown sortBy '{sortBy}'. Use 'Name' or 'AverageRating'.");
        }

        var descending = sortDirection?.ToUpperInvariant() switch
        {
            "DESC" => true,
            "ASC" => false,
            _ => parsedSortBy == TrainerSortBy.AverageRating
        };

        var result = await trainerService.GetAllAsync(page, pageSize, filter, parsedSortBy, descending, cancellationToken);
        var trainerIds = result.Items.Select(t => t.Id).ToList();
        var summaries = await trainerReviewService.GetSummariesAsync(trainerIds, cancellationToken);

        return Ok(new PagedResponse<TrainerResponse>
        {
            Items = result.Items.Select(t => ToResponse(t, summaries[t.Id])).ToList(),
            TotalCount = result.TotalCount,
            Page = result.Page,
            PageSize = result.PageSize
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TrainerResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var trainer = await trainerService.GetByIdAsync(id, cancellationToken);
        if (trainer is null)
        {
            return NotFound();
        }

        var summary = await trainerReviewService.GetSummaryAsync(id, cancellationToken);
        return Ok(ToResponse(trainer, summary));
    }

    [HttpPatch("{id:guid}")]
    [Authorize(Policy = "SameUserOrAdmin")]
    public async Task<IActionResult> Update(Guid id, UpdateTrainerRequest request, CancellationToken cancellationToken)
    {
        await trainerService.UpdateAsync(id, request.Name, request.Language, request.Education, request.Bio, cancellationToken);
        return NoContent();
    }

    [HttpDelete("{id:guid}")]
    [Authorize(Policy = "SameUserOrAdmin")]
    public async Task<IActionResult> Delete(Guid id, CancellationToken cancellationToken)
    {
        await trainerService.DeleteAsync(id, cancellationToken);
        return NoContent();
    }
    
    [HttpGet("{id:guid}/cooperations")]
    [Authorize(Policy = "SameUserOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<CooperationResponse>>> GetCooperations(Guid id, [FromQuery] string? status, CancellationToken cancellationToken)
    {
        CooperationStatus? statusFilter = null;
        if (!string.IsNullOrWhiteSpace(status))
        {
            if (!Enum.TryParse<CooperationStatus>(status, ignoreCase: true, out var parsed))
            {
                return BadRequest($"Unknown status '{status}'.");
            }
            statusFilter = parsed;
        }

        var cooperations = await cooperationService.GetForTrainerAsync(id, statusFilter, cancellationToken);
        return Ok(cooperations.Select(CooperationResponse.FromDomain));
    }
    
    [HttpGet("{id:guid}/pricing-tiers")]
    public async Task<ActionResult<IReadOnlyList<PricingTierResponse>>> GetPricingTiers(Guid id, CancellationToken cancellationToken)
    {
        var isOwnerOrAdmin = currentUser.Role == UserRole.Admin || currentUser.UserId == id;
        var tiers = await pricingTierService.GetForTrainerAsync(id, activeOnly: !isOwnerOrAdmin, cancellationToken);
        return Ok(tiers.Select(PricingTierResponse.FromDomain));
    }

    [HttpPost("{id:guid}/pricing-tiers")]
    [Authorize(Policy = "SameUserOrAdmin")]
    public async Task<ActionResult<PricingTierResponse>> CreatePricingTier(Guid id, CreatePricingTierRequest request, CancellationToken cancellationToken)
    {
        var tier = await pricingTierService.CreateAsync(id, request.SessionsPerWeek, request.MonthlyPrice, cancellationToken);
        return CreatedAtAction(nameof(PricingTiersController.GetById), "PricingTiers", new { id = tier.Id }, PricingTierResponse.FromDomain(tier));
    }

    [HttpGet("{id:guid}/exercises")]
    [Authorize(Policy = "SameUserOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<ExerciseResponse>>> GetExercises(Guid id, CancellationToken cancellationToken)
    {
        var exercises = await exerciseService.GetForTrainerAsync(id, cancellationToken);
        return Ok(exercises.Select(ExerciseResponse.FromDomain));
    }

    [HttpPost("{id:guid}/exercises")]
    [Authorize(Policy = "SameUserOrAdmin")]
    public async Task<ActionResult<ExerciseResponse>> CreateExercise(Guid id, CreateExerciseRequest request, CancellationToken cancellationToken)
    {
        var exercise = await exerciseService.CreateAsync(id, request.Name, request.DefaultReps, request.DefaultSets, cancellationToken);
        return CreatedAtAction(nameof(ExercisesController.GetById), "Exercises", new { id = exercise.Id }, ExerciseResponse.FromDomain(exercise));
    }
    
    [HttpGet("{id:guid}/credentials")]
    [Authorize(Policy = "SameUserOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<CredentialResponse>>> GetCredentials(Guid id, CancellationToken cancellationToken)
    {
        var credentials = await credentialService.GetForTrainerAsync(id, cancellationToken);
        return Ok(credentials.Select(CredentialResponse.FromDomain));
    }

    [HttpPost("{id:guid}/credentials")]
    [Authorize(Policy = "SameUserOrAdmin")]
    public async Task<ActionResult<CredentialResponse>> AddCredential(Guid id, CredentialRequest request, CancellationToken cancellationToken)
    {
        var credential = await credentialService.AddAsync(id, request.Type, request.FileUrl, request.IssuedBy, cancellationToken);
        return CreatedAtAction(nameof(GetCredentials), new { id }, CredentialResponse.FromDomain(credential));
    }

    [HttpDelete("{id:guid}/credentials/{credentialId:guid}")]
    [Authorize(Policy = "SameUserOrAdmin")]
    public async Task<IActionResult> DeleteCredential(Guid id, Guid credentialId, CancellationToken cancellationToken)
    {
        await credentialService.DeleteAsync(credentialId, cancellationToken);
        return NoContent();
    }

    [HttpPost("{id:guid}/approve")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<TrainerResponse>> Approve(Guid id, CancellationToken cancellationToken)
    {
        var trainer = await trainerService.ApproveAsync(id, cancellationToken);
        return Ok(ToResponse(trainer, TrainerReviewSummary.Empty));
    }

    [HttpPost("{id:guid}/reject")]
    [Authorize(Roles = nameof(UserRole.Admin))]
    public async Task<ActionResult<TrainerResponse>> Reject(Guid id, CancellationToken cancellationToken)
    {
        var trainer = await trainerService.RejectAsync(id, cancellationToken);
        return Ok(ToResponse(trainer, TrainerReviewSummary.Empty));
    }
    
    [HttpGet("{id:guid}/reviews")]
    public async Task<ActionResult<IReadOnlyList<TrainerReviewResponse>>> GetReviews(Guid id, CancellationToken cancellationToken)
    {
        var reviews = await trainerReviewService.GetForTrainerAsync(id, cancellationToken);
        return Ok(reviews.Select(TrainerReviewResponse.FromDomain));
    }

    [HttpPut("{id:guid}/reviews")]
    [Authorize(Roles = nameof(UserRole.Client))]
    public async Task<ActionResult<TrainerReviewResponse>> UpsertReview(Guid id, UpsertTrainerReviewRequest request, CancellationToken cancellationToken)
    {
        var review = await trainerReviewService.UpsertAsync(id, currentUser.UserId!.Value, request.Rating, request.Comment, cancellationToken);
        return Ok(TrainerReviewResponse.FromDomain(review));
    }

    private static TrainerResponse ToResponse(Trainer trainer, TrainerReviewSummary summary) => new()
    {
        Id = trainer.Id,
        Name = trainer.Name,
        Email = trainer.Email,
        Language = trainer.Language,
        CreatedAt = trainer.CreatedAt,
        RegistrationStatus = trainer.RegistrationStatus,
        Education = trainer.Education,
        Bio = trainer.Bio,
        ApprovedAt = trainer.ApprovedAt,
        AverageRating = summary.AverageRating,
        ReviewCount = summary.ReviewCount
    };
}