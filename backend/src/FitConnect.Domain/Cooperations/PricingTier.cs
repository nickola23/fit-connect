namespace FitConnect.Domain.Cooperations;

public class PricingTier
{
    public Guid Id { get; }
    public Guid TrainerId { get; }
    public int SessionsPerWeek { get; }
    public decimal MonthlyPrice { get; private set; }
    public bool Active { get; private set; }

    public PricingTier(Guid id, Guid trainerId, int sessionsPerWeek, decimal monthlyPrice, bool active)
    {
        if (sessionsPerWeek <= 0)
        {
            throw new ArgumentOutOfRangeException(nameof(sessionsPerWeek), "Sessions per week must be positive.");
        }

        Id = id;
        TrainerId = trainerId;
        SessionsPerWeek = sessionsPerWeek;
        MonthlyPrice = monthlyPrice;
        Active = active;
    }

    public void UpdateMonthlyPrice(decimal monthlyPrice)
    {
        if (monthlyPrice < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(monthlyPrice), "Monthly price cannot be negative.");
        }

        MonthlyPrice = monthlyPrice;
    }

    public void Deactivate()
    {
        Active = false;
    }

    public void Activate()
    {
        Active = true;
    }
}