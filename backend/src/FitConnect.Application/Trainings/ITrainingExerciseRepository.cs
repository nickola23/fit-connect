using FitConnect.Domain.Trainings;

namespace FitConnect.Application.Trainings;

public interface ITrainingExerciseRepository
{
    Task<TrainingExercise?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<TrainingExercise>> GetForTrainingAsync(Guid trainingId, CancellationToken cancellationToken = default);
    Task<Guid?> GetOwningClientIdAsync(Guid trainingExerciseId, CancellationToken cancellationToken = default);
    Task UpdateAsync(TrainingExercise trainingExercise, CancellationToken cancellationToken = default);
}