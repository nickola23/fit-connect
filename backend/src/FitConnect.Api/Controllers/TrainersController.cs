using FitConnect.Api.Contracts.Common;
using FitConnect.Api.Contracts.Cooperations;
using FitConnect.Api.Contracts.Exercises;
using FitConnect.Api.Contracts.PricingTiers;
using FitConnect.Api.Contracts.Trainers;
using FitConnect.Application.Common;
using FitConnect.Application.Cooperations;
using FitConnect.Application.Exercises;
using FitConnect.Application.Users;
using FitConnect.Domain.Cooperations;
using FitConnect.Domain.Enums;
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

    public TrainersController(TrainerService trainerService, CooperationService cooperationService,
        PricingTierService pricingTierService, ExerciseService exerciseService, ICurrentUserAccessor currentUser)
    {
        this.trainerService = trainerService;
        this.cooperationService = cooperationService;
        this.pricingTierService = pricingTierService;
        this.exerciseService = exerciseService;
        this.currentUser = currentUser; 
    }

    [HttpGet]
    public async Task<ActionResult<PagedResponse<TrainerResponse>>> GetAll(
        [FromQuery] int page = 1, [FromQuery] int pageSize = 20, CancellationToken cancellationToken = default)
    {
        var result = await trainerService.GetAllAsync(page, pageSize, cancellationToken);
        return Ok(new PagedResponse<TrainerResponse>
        {
            Items = result.Items.Select(ToResponse).ToList(),
            TotalCount = result.TotalCount,
            Page = result.Page,
            PageSize = result.PageSize
        });
    }

    [HttpGet("{id:guid}")]
    public async Task<ActionResult<TrainerResponse>> GetById(Guid id, CancellationToken cancellationToken)
    {
        var trainer = await trainerService.GetByIdAsync(id, cancellationToken);
        return trainer is null ? NotFound() : Ok(ToResponse(trainer));
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

    private static TrainerResponse ToResponse(Trainer trainer) => new()
    {
        Id = trainer.Id,
        Name = trainer.Name,
        Email = trainer.Email,
        Language = trainer.Language,
        CreatedAt = trainer.CreatedAt,
        RegistrationStatus = trainer.RegistrationStatus,
        Education = trainer.Education,
        Bio = trainer.Bio,
        ApprovedAt = trainer.ApprovedAt
    };
}