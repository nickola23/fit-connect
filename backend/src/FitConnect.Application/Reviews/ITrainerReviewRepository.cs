using FitConnect.Domain.Reviews;

namespace FitConnect.Application.Reviews;

public interface ITrainerReviewRepository
{
    Task<TrainerReview?> GetByTrainerAndClientAsync(Guid trainerId, Guid clientId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TrainerReview>> GetForTrainerAsync(Guid trainerId, CancellationToken cancellationToken = default);
    Task<TrainerReview> CreateAsync(TrainerReview review, CancellationToken cancellationToken = default);
    Task UpdateAsync(TrainerReview review, CancellationToken cancellationToken = default);
    Task<IReadOnlyDictionary<Guid, TrainerReviewSummary>> GetSummariesAsync(IReadOnlyList<Guid> trainerIds, CancellationToken cancellationToken = default);
}