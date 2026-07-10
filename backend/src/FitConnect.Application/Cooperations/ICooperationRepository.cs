using FitConnect.Domain.Cooperations;
using FitConnect.Domain.Enums;

namespace FitConnect.Application.Cooperations;

public interface ICooperationRepository
{
    Task<Cooperation?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<CooperationParticipants?> GetParticipantsAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Cooperation>> GetForClientAsync(Guid clientId, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Cooperation>> GetForTrainerAsync(Guid trainerId, CooperationStatus? statusFilter = null, CancellationToken cancellationToken = default);
    Task<bool> HasAcceptedOrActiveCooperationAsync(Guid clientId, CancellationToken cancellationToken = default);
    Task<Cooperation> CreateAsync(Cooperation cooperation, CancellationToken cancellationToken = default);
    Task UpdateAsync(Cooperation cooperation, CancellationToken cancellationToken = default);
    Task<bool> ExistsCooperationBetweenAsync(Guid trainerId, Guid clientId, CancellationToken cancellationToken = default);
}