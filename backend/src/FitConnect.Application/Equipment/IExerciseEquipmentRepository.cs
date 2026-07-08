namespace FitConnect.Application.Equipment;

public interface IExerciseEquipmentRepository
{
    Task<IReadOnlyList<Domain.Equipment.Equipment>> GetForExerciseAsync(Guid exerciseId, CancellationToken cancellationToken = default);
    Task AddAsync(Guid exerciseId, Guid equipmentId, CancellationToken cancellationToken = default);
    Task RemoveAsync(Guid exerciseId, Guid equipmentId, CancellationToken cancellationToken = default);
}