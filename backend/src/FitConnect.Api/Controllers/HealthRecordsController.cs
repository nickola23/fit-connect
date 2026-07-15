using FitConnect.Api.Contracts.HealthRecords;
using FitConnect.Application.HealthRecords;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace FitConnect.Api.Controllers;

[ApiController]
[Route("api/clients/{clientId:guid}/health-records")]
[Authorize]
public class HealthRecordsController : ControllerBase
{
    private readonly HealthRecordService healthRecordService;

    public HealthRecordsController(HealthRecordService healthRecordService)
    {
        this.healthRecordService = healthRecordService;
    }

    // History, range-based ?fromDate=&toDate=
    [HttpGet]
    [Authorize(Policy = "HealthRecordAccess")]
    public async Task<ActionResult<IReadOnlyList<HealthRecordResponse>>> GetHistory(
        Guid clientId, [FromQuery] DateOnly? fromDate, [FromQuery] DateOnly? toDate, CancellationToken cancellationToken)
    {
        var history = await healthRecordService.GetHistoryAsync(clientId, fromDate, toDate, cancellationToken);
        return Ok(history.Select(HealthRecordResponse.FromDomain));
    }

    [HttpPost]
    [Authorize(Policy = "HealthRecordOwnerOnly")]
    public async Task<ActionResult<HealthRecordResponse>> Add(Guid clientId, CreateHealthRecordRequest request, CancellationToken cancellationToken)
    {
        var record = await healthRecordService.AddAsync(clientId, request.Weight, request.Height, request.HealthCondition, cancellationToken);
        return CreatedAtAction(nameof(GetHistory), new { clientId }, HealthRecordResponse.FromDomain(record));
    }
}