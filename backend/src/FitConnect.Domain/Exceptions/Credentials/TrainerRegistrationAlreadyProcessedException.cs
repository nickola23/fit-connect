using FitConnect.Domain.Enums;

namespace FitConnect.Domain.Exceptions.Credentials;

public class TrainerRegistrationAlreadyProcessedException : Exception
{
    public TrainerRegistrationAlreadyProcessedException(Guid trainerId, RegistrationStatus currentStatus)
        : base($"Trainer '{trainerId}' registration is already '{currentStatus}' and cannot be re-processed.")
    {
    }
}