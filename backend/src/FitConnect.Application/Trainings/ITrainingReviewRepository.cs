using FitConnect.Domain.Trainings;

namespace FitConnect.Application.Trainings;

public interface ITrainingReviewRepository
{
    Task<TrainingReview?> GetByTrainingIdAsync(Guid trainingId, CancellationToken cancellationToken = default);
    Task<TrainingReview> CreateAsync(TrainingReview review, CancellationToken cancellationToken = default);
}