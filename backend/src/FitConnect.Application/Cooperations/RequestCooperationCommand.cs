namespace FitConnect.Application.Cooperations;

public class RequestCooperationCommand
{
    public required Guid TrainerId { get; init; }
    public required Guid ClientId { get; init; }
    public Guid? PricingTierId { get; init; }
    public bool IsFreeTrial { get; init; }
}