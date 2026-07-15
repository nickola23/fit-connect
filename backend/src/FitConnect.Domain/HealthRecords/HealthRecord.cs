using FitConnect.Domain.Exceptions.HealthRecords;

namespace FitConnect.Domain.HealthRecords;

public class HealthRecord
{
    public Guid Id { get; }
    public Guid ClientId { get; }
    public DateOnly RecordDate { get; }
    public decimal? Weight { get; }
    public decimal? Height { get; }
    public string? HealthCondition { get; }

    public HealthRecord(Guid id, Guid clientId, DateOnly recordDate, decimal? weight, decimal? height, string? healthCondition)
    {
        if (weight is null && height is null && string.IsNullOrWhiteSpace(healthCondition))
        {
            throw new HealthRecordEntryEmptyException();
        }

        if (weight is < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(weight), "Weight cannot be negative.");
        }

        if (height is < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(height), "Height cannot be negative.");
        }

        Id = id;
        ClientId = clientId;
        RecordDate = recordDate;
        Weight = weight;
        Height = height;
        HealthCondition = healthCondition;
    }
}