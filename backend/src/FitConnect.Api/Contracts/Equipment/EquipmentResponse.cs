namespace FitConnect.Api.Contracts.Equipment;

public class EquipmentResponse
{
    public required Guid Id { get; init; }
    public required string Name { get; init; }

    public static EquipmentResponse FromDomain(FitConnect.Domain.Equipment.Equipment equipment) => new()
    {
        Id = equipment.Id,
        Name = equipment.Name
    };
}