namespace FitConnect.Api.Contracts.Cooperations;

public class CreateCooperationRequest
{
    public required Guid TrainerId { get; init; }
    public Guid? PricingTierId { get; init; }
    public bool IsFreeTrial { get; init; }
}