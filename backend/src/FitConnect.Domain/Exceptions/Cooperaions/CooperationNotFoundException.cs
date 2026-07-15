namespace FitConnect.Domain.Exceptions;

public class CooperationNotFoundException : Exception
{
    public CooperationNotFoundException(Guid cooperationId)
        : base($"Cooperation with id '{cooperationId}' was not found.")
    {
    }
}