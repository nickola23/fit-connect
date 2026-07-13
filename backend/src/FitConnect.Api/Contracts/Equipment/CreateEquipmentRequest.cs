using FitConnect.Domain.Enums;

namespace FitConnect.Api.Contracts.Equipment;

public class CreateEquipmentRequest
{
    public required string Name { get; init; }
    public required EquipmentType Type { get; init; }
}