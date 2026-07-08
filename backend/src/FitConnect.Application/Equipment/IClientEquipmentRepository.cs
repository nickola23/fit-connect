namespace FitConnect.Application.Equipment;

public interface IClientEquipmentRepository
{
    Task<IReadOnlyList<Domain.Equipment.Equipment>> GetForClientAsync(Guid clientId, CancellationToken cancellationToken = default);
    Task AddAsync(Guid clientId, Guid equipmentId, CancellationToken cancellationToken = default);
    Task RemoveAsync(Guid clientId, Guid equipmentId, CancellationToken cancellationToken = default);
}