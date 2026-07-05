using FitConnect.Api.Contracts.Common;
using FitConnect.Api.Contracts.Trainers;
using FitConnect.Application.Users;
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

    public TrainersController(TrainerService trainerService)
    {
        this.trainerService = trainerService;
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