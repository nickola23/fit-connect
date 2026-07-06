namespace FitConnect.Domain.Exceptions;

public class TrainerNotApprovedException : Exception
{
    public TrainerNotApprovedException(Guid trainerId)
        : base($"Trainer '{trainerId}' is not an approved trainer yet.")
    {
    }
}