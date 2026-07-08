using FitConnect.Application.Cooperations;
using FitConnect.Domain.Trainings;

namespace FitConnect.Application.Trainings;

public interface ITrainingRepository
{
    Task<Training?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Training>> GetForCooperationAsync(Guid cooperationId, CancellationToken cancellationToken = default);
    Task<CooperationParticipants?> GetParticipantsAsync(Guid trainingId, CancellationToken cancellationToken = default);
    Task<Training> CreateAsync(Training training, IReadOnlyList<TrainingExercise> exercises, CancellationToken cancellationToken = default);
    Task UpdateStatusAsync(Training training, CancellationToken cancellationToken = default);
}