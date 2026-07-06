using FitConnect.Domain.Cooperations;

namespace FitConnect.Domain.Exceptions;

public class InvalidCooperationStatusTransitionException : Exception
{
    public InvalidCooperationStatusTransitionException(CooperationStatus from, CooperationStatus to)
        : base($"Cannot transition cooperation from '{from}' to '{to}'.")
    {
    }
}