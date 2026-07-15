using FitConnect.Domain.HealthRecords;

namespace FitConnect.Application.HealthRecords;

public interface IHealthRecordRepository
{
    Task<IReadOnlyList<HealthRecord>> GetForClientAsync(
        Guid clientId, DateOnly? fromDate, DateOnly? toDate, CancellationToken cancellationToken = default);

    Task<HealthRecord> CreateAsync(HealthRecord record, CancellationToken cancellationToken = default);
}