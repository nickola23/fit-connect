using FitConnect.Application.Cooperations;
using FitConnect.Application.Users;
using FitConnect.Domain.Exceptions;
using FitConnect.Domain.Exceptions.Reviews;
using FitConnect.Domain.Reviews;

namespace FitConnect.Application.Reviews;

public class TrainerReviewService
{
    private readonly ITrainerReviewRepository trainerReviewRepository;
    private readonly ICooperationRepository cooperationRepository;
    private readonly ITrainerRepository trainerRepository;

    public TrainerReviewService(
        ITrainerReviewRepository trainerReviewRepository,
        ICooperationRepository cooperationRepository,
        ITrainerRepository trainerRepository)
    {
        this.trainerReviewRepository = trainerReviewRepository;
        this.cooperationRepository = cooperationRepository;
        this.trainerRepository = trainerRepository;
    }

    public Task<IReadOnlyList<TrainerReview>> GetForTrainerAsync(Guid trainerId, CancellationToken cancellationToken = default) =>
        trainerReviewRepository.GetForTrainerAsync(trainerId, cancellationToken);

    public async Task<TrainerReviewSummary> GetSummaryAsync(Guid trainerId, CancellationToken cancellationToken = default)
    {
        var summaries = await GetSummariesAsync(new[] { trainerId }, cancellationToken);
        return summaries[trainerId];
    }

    public async Task<IReadOnlyDictionary<Guid, TrainerReviewSummary>> GetSummariesAsync(
        IReadOnlyList<Guid> trainerIds, CancellationToken cancellationToken = default)
    {
        var found = await trainerReviewRepository.GetSummariesAsync(trainerIds, cancellationToken);

        return trainerIds.ToDictionary(id => id, id => found.GetValueOrDefault(id, TrainerReviewSummary.Empty));
    }

    public async Task<TrainerReview> UpsertAsync(Guid trainerId, Guid clientId, int rating, string? comment, CancellationToken cancellationToken = default)
    {
        _ = await trainerRepository.GetByIdAsync(trainerId, cancellationToken)
            ?? throw new UserNotFoundException(trainerId);

        if (!await cooperationRepository.ExistsCooperationBetweenAsync(trainerId, clientId, cancellationToken))
        {
            throw new ClientHasNotCooperatedWithTrainerException(clientId, trainerId);
        }

        var existing = await trainerReviewRepository.GetByTrainerAndClientAsync(trainerId, clientId, cancellationToken);

        if (existing is not null)
        {
            existing.UpdateReview(rating, comment);
            await trainerReviewRepository.UpdateAsync(existing, cancellationToken);
            return existing;
        }

        var review = new TrainerReview(Guid.NewGuid(), trainerId, clientId, rating, comment, DateOnly.FromDateTime(DateTime.UtcNow));
        return await trainerReviewRepository.CreateAsync(review, cancellationToken);
    }
}