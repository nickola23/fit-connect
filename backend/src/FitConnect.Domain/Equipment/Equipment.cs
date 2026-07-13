using FitConnect.Domain.Enums;

namespace FitConnect.Domain.Equipment;

public class Equipment
{
    public Guid Id { get; }
    public string Name { get; private set; }
    public EquipmentType Type { get; private set; }

    public Equipment(Guid id, string name, EquipmentType type)
    {
        Id = id;
        Name = name;
        Type = type;
    }

    public void UpdateDetails(string name, EquipmentType type)
    {
        Name = name;
        Type = type;
    }
}