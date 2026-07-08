using FitConnect.Domain.Exceptions;

namespace FitConnect.Application.Equipment;

public class ExerciseEquipmentService
{
    private readonly IExerciseEquipmentRepository exerciseEquipmentRepository;
    private readonly IEquipmentRepository equipmentRepository;

    public ExerciseEquipmentService(IExerciseEquipmentRepository exerciseEquipmentRepository, IEquipmentRepository equipmentRepository)
    {
        this.exerciseEquipmentRepository = exerciseEquipmentRepository;
        this.equipmentRepository = equipmentRepository;
    }

    public Task<IReadOnlyList<Domain.Equipment.Equipment>> GetForExerciseAsync(Guid exerciseId, CancellationToken cancellationToken = default) =>
        exerciseEquipmentRepository.GetForExerciseAsync(exerciseId, cancellationToken);

    public async Task AddAsync(Guid exerciseId, Guid equipmentId, CancellationToken cancellationToken = default)
    {
        _ = await equipmentRepository.GetByIdAsync(equipmentId, cancellationToken)
            ?? throw new EquipmentNotFoundException(equipmentId);

        await exerciseEquipmentRepository.AddAsync(exerciseId, equipmentId, cancellationToken);
    }

    public Task RemoveAsync(Guid exerciseId, Guid equipmentId, CancellationToken cancellationToken = default) =>
        exerciseEquipmentRepository.RemoveAsync(exerciseId, equipmentId, cancellationToken);
}