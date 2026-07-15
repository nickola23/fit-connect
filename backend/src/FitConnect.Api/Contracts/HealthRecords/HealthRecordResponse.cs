using FitConnect.Domain.HealthRecords;

namespace FitConnect.Api.Contracts.HealthRecords;

public class HealthRecordResponse
{
    public required Guid Id { get; init; }
    public required Guid ClientId { get; init; }
    public required DateOnly RecordDate { get; init; }
    public decimal? Weight { get; init; }
    public decimal? Height { get; init; }
    public string? HealthCondition { get; init; }

    public static HealthRecordResponse FromDomain(HealthRecord record) => new()
    {
        Id = record.Id,
        ClientId = record.ClientId,
        RecordDate = record.RecordDate,
        Weight = record.Weight,
        Height = record.Height,
        HealthCondition = record.HealthCondition
    };
}