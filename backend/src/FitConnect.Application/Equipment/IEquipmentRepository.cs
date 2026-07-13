using FitConnect.Domain.Enums;

namespace FitConnect.Application.Equipment;

public interface IEquipmentRepository
{
    Task<Domain.Equipment.Equipment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IReadOnlyList<Domain.Equipment.Equipment>> GetAllAsync(EquipmentType? typeFilter = null, CancellationToken cancellationToken = default);
    Task<Domain.Equipment.Equipment> CreateAsync(Domain.Equipment.Equipment equipment, CancellationToken cancellationToken = default);
    Task UpdateAsync(Domain.Equipment.Equipment equipment, CancellationToken cancellationToken = default);
    Task DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<bool> IsReferencedAsync(Guid id, CancellationToken cancellationToken = default);
}