using FitConnect.Api.Contracts.Cooperations;
using FitConnect.Api.Contracts.Payments;
using FitConnect.Api.Contracts.Trainings;
using FitConnect.Application.Common;
using FitConnect.Application.Cooperations;
using FitConnect.Application.Payments;
using FitConnect.Application.Trainings;
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
    private readonly TrainingService trainingService;
    private readonly PaymentService paymentService;

    public CooperationsController(
        CooperationService cooperationService,
        ICurrentUserAccessor currentUser,
        TrainingService trainingService,
        PaymentService paymentService)
    {
        this.cooperationService = cooperationService;
        this.currentUser = currentUser;
        this.trainingService = trainingService;
        this.paymentService = paymentService;
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
    
    [HttpPost("{id:guid}/trainings")]
    [Authorize(Policy = "CooperationTrainerParticipant")]
    public async Task<ActionResult<TrainingResponse>> AssignTraining(Guid id, AssignTrainingRequest request, CancellationToken cancellationToken)
    {
        var command = new AssignTrainingCommand
        {
            CooperationId = id,
            Type = request.Type,
            TrainingDate = request.TrainingDate,
            MeetingLink = request.MeetingLink,
            TargetDate = request.TargetDate,
            Exercises = request.Exercises.Select(e => new TrainingExerciseAssignment(e.ExerciseId, e.Reps, e.Sets)).ToList()
        };

        var training = await trainingService.AssignAsync(command, cancellationToken);
        return CreatedAtAction(nameof(TrainingsController.GetById), "Trainings", new { id = training.Id }, TrainingResponse.FromDomain(training));
    }

    [HttpGet("{id:guid}/trainings")]
    [Authorize(Policy = "CooperationParticipantOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<TrainingResponse>>> GetTrainings(Guid id, CancellationToken cancellationToken)
    {
        var trainings = await trainingService.GetForCooperationAsync(id, cancellationToken);
        return Ok(trainings.Select(TrainingResponse.FromDomain));
    }
    
    [HttpGet("{id:guid}/payments")]
    [Authorize(Policy = "CooperationParticipantOrAdmin")]
    public async Task<ActionResult<IReadOnlyList<PaymentResponse>>> GetPayments(Guid id, CancellationToken cancellationToken)
    {
        var payments = await paymentService.GetForCooperationAsync(id, cancellationToken);
        return Ok(payments.Select(PaymentResponse.FromDomain));
    }

    [HttpPost("{id:guid}/payments")]
    [Authorize(Policy = "CooperationTrainerParticipantOrAdmin")]
    public async Task<ActionResult<PaymentResponse>> RecordPayment(Guid id, CancellationToken cancellationToken)
    {
        var payment = await paymentService.RecordAsync(id, cancellationToken);
        return CreatedAtAction(nameof(GetPayments), new { id }, PaymentResponse.FromDomain(payment));
    }
}