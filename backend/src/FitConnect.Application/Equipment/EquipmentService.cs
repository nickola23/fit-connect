using FitConnect.Domain.Exceptions;

namespace FitConnect.Application.Equipment;

public class EquipmentService
{
    private readonly IEquipmentRepository equipmentRepository;

    public EquipmentService(IEquipmentRepository equipmentRepository)
    {
        this.equipmentRepository = equipmentRepository;
    }

    public Task<Domain.Equipment.Equipment?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) =>
        equipmentRepository.GetByIdAsync(id, cancellationToken);

    public Task<IReadOnlyList<Domain.Equipment.Equipment>> GetAllAsync(CancellationToken cancellationToken = default) =>
        equipmentRepository.GetAllAsync(cancellationToken);

    public Task<Domain.Equipment.Equipment> CreateAsync(string name, CancellationToken cancellationToken = default)
    {
        var equipment = new Domain.Equipment.Equipment(Guid.NewGuid(), name.Trim());
        return equipmentRepository.CreateAsync(equipment, cancellationToken);
    }

    public async Task UpdateAsync(Guid id, string name, CancellationToken cancellationToken = default)
    {
        var equipment = await equipmentRepository.GetByIdAsync(id, cancellationToken)
                        ?? throw new EquipmentNotFoundException(id);

        equipment.Rename(name.Trim());
        await equipmentRepository.UpdateAsync(equipment, cancellationToken);
    }

    public async Task DeleteAsync(Guid id, CancellationToken cancellationToken = default)
    {
        if (await equipmentRepository.IsReferencedAsync(id, cancellationToken))
        {
            throw new EquipmentInUseException(id);
        }

        await equipmentRepository.DeleteAsync(id, cancellationToken);
    }
}