using FitConnect.Domain.Exceptions.Trainings;
using FitConnect.Domain.Trainings;
using FitConnect.Domain.Enums;

namespace FitConnect.Application.Trainings;

public class TrainingReviewService
{
    private readonly ITrainingReviewRepository trainingReviewRepository;
    private readonly ITrainingRepository trainingRepository;

    public TrainingReviewService(ITrainingReviewRepository trainingReviewRepository, ITrainingRepository trainingRepository)
    {
        this.trainingReviewRepository = trainingReviewRepository;
        this.trainingRepository = trainingRepository;
    }

    public Task<TrainingReview?> GetByTrainingIdAsync(Guid trainingId, CancellationToken cancellationToken = default) =>
        trainingReviewRepository.GetByTrainingIdAsync(trainingId, cancellationToken);

    public async Task<TrainingReview> CreateAsync(Guid trainingId, Guid trainerId, int rating, string? comment, CancellationToken cancellationToken = default)
    {
        var training = await trainingRepository.GetByIdAsync(trainingId, cancellationToken)
                       ?? throw new TrainingNotFoundException(trainingId);

        if (training.Status != TrainingStatus.Completed)
        {
            throw new TrainingNotCompletedException(trainingId);
        }

        var review = new TrainingReview(Guid.NewGuid(), trainingId, trainerId, rating, comment);
        return await trainingReviewRepository.CreateAsync(review, cancellationToken);
    }
}