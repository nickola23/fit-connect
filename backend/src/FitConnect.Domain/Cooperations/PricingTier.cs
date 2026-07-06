namespace FitConnect.Domain.Cooperations;

public class PricingTier
{
    public Guid Id { get; }
    public Guid TrainerId { get; }
    public int SessionsPerWeek { get; }
    public decimal MonthlyPrice { get; }
    public bool Active { get; }

    public PricingTier(Guid id, Guid trainerId, int sessionsPerWeek, decimal monthlyPrice, bool active)
    {
        Id = id;
        TrainerId = trainerId;
        SessionsPerWeek = sessionsPerWeek;
        MonthlyPrice = monthlyPrice;
        Active = active;
    }
}