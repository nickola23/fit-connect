using FitConnect.Domain.Exercises;

namespace FitConnect.Application.Exercises;

public interface IExerciseRepository
{
    Task<Exercise?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Exercise>> GetForTrainerAsync(Guid trainerId, CancellationToken cancellationToken = default);
    Task<Exercise> CreateAsync(Exercise exercise, CancellationToken cancellationToken = default);
    Task UpdateAsync(Exercise exercise, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
}