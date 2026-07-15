using FitConnect.Domain.HealthRecords;

namespace FitConnect.Application.HealthRecords;

public class HealthRecordService
{
    private readonly IHealthRecordRepository healthRecordRepository;

    public HealthRecordService(IHealthRecordRepository healthRecordRepository)
    {
        this.healthRecordRepository = healthRecordRepository;
    }

    public Task<IReadOnlyList<HealthRecord>> GetHistoryAsync(
        Guid clientId, DateOnly? fromDate, DateOnly? toDate, CancellationToken cancellationToken = default) =>
        healthRecordRepository.GetForClientAsync(clientId, fromDate, toDate, cancellationToken);

    public Task<HealthRecord> AddAsync(
        Guid clientId, decimal? weight, decimal? height, string? healthCondition, CancellationToken cancellationToken = default)
    {
        var record = new HealthRecord(Guid.NewGuid(), clientId, DateOnly.FromDateTime(DateTime.UtcNow), weight, height, healthCondition);
        return healthRecordRepository.CreateAsync(record, cancellationToken);
    }
}