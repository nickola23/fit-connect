using FitConnect.Domain.Exceptions.Trainings;
using FitConnect.Domain.Trainings;

namespace FitConnect.Application.Trainings;

public class TrainingExerciseService
{
    private readonly ITrainingExerciseRepository trainingExerciseRepository;

    public TrainingExerciseService(ITrainingExerciseRepository trainingExerciseRepository)
    {
        this.trainingExerciseRepository = trainingExerciseRepository;
    }

    public Task<IReadOnlyList<TrainingExercise>> GetForTrainingAsync(Guid trainingId, CancellationToken cancellationToken = default) =>
        trainingExerciseRepository.GetForTrainingAsync(trainingId, cancellationToken);

    public async Task MarkDoneAsync(Guid trainingExerciseId, int? difficultyRating, string? comment, CancellationToken cancellationToken = default)
    {
        var trainingExercise = await trainingExerciseRepository.GetByIdAsync(trainingExerciseId, cancellationToken)
                               ?? throw new TrainingExerciseNotFoundException(trainingExerciseId);

        trainingExercise.MarkDone(difficultyRating, comment);
        await trainingExerciseRepository.UpdateAsync(trainingExercise, cancellationToken);
    }
}