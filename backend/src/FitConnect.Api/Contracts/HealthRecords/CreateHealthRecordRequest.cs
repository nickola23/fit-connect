namespace FitConnect.Api.Contracts.HealthRecords;

public class CreateHealthRecordRequest
{
    public decimal? Weight { get; init; }
    public decimal? Height { get; init; }
    public string? HealthCondition { get; init; }
}