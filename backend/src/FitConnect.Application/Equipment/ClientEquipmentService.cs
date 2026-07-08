using FitConnect.Domain.Exceptions;

namespace FitConnect.Application.Equipment;

public class ClientEquipmentService
{
    private readonly IClientEquipmentRepository clientEquipmentRepository;
    private readonly IEquipmentRepository equipmentRepository;

    public ClientEquipmentService(IClientEquipmentRepository clientEquipmentRepository, IEquipmentRepository equipmentRepository)
    {
        this.clientEquipmentRepository = clientEquipmentRepository;
        this.equipmentRepository = equipmentRepository;
    }

    public Task<IReadOnlyList<Domain.Equipment.Equipment>> GetForClientAsync(Guid clientId, CancellationToken cancellationToken = default) =>
        clientEquipmentRepository.GetForClientAsync(clientId, cancellationToken);

    public async Task AddAsync(Guid clientId, Guid equipmentId, CancellationToken cancellationToken = default)
    {
        _ = await equipmentRepository.GetByIdAsync(equipmentId, cancellationToken)
            ?? throw new EquipmentNotFoundException(equipmentId);

        await clientEquipmentRepository.AddAsync(clientId, equipmentId, cancellationToken);
    }

    public Task RemoveAsync(Guid clientId, Guid equipmentId, CancellationToken cancellationToken = default) =>
        clientEquipmentRepository.RemoveAsync(clientId, equipmentId, cancellationToken);
}