namespace FitConnect.Domain.Exceptions;

public class EquipmentNotFoundException : Exception
{
    public EquipmentNotFoundException(Guid equipmentId)
        : base($"Equipment with id '{equipmentId}' was not found.")
    {
    }
}