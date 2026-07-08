namespace FitConnect.Domain.Exceptions;

public class DuplicateEquipmentNameException : Exception
{
    public DuplicateEquipmentNameException(string name)
        : base($"Equipment named '{name}' already exists.")
    {
    }
}