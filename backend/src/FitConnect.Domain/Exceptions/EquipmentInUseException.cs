namespace FitConnect.Domain.Exceptions;

public class EquipmentInUseException : Exception
{
    public EquipmentInUseException(Guid equipmentId)
        : base($"Equipment '{equipmentId}' cannot be deleted because it is linked to one or more exercises or clients.")
    {
    }
}