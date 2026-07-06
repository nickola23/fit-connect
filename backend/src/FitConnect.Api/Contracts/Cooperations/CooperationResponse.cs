using FitConnect.Domain.Cooperations;

namespace FitConnect.Api.Contracts.Cooperations;

public class CooperationResponse
{
    public required Guid Id { get; init; }
    public required Guid TrainerId { get; init; }
    public required Guid ClientId { get; init; }
    public Guid? PricingTierId { get; init; }
    public required string Status { get; init; }
    public required DateTimeOffset RequestDate { get; init; }
    public DateOnly? StartDate { get; init; }
    public DateOnly? EndDate { get; init; }
    public required bool IsFreeTrial { get; init; }

    public static CooperationResponse FromDomain(Cooperation cooperation) => new()
    {
        Id = cooperation.Id,
        TrainerId = cooperation.TrainerId,
        ClientId = cooperation.ClientId,
        PricingTierId = cooperation.PricingTierId,
        Status = cooperation.Status.ToString(),
        RequestDate = cooperation.RequestDate,
        StartDate = cooperation.StartDate,
        EndDate = cooperation.EndDate,
        IsFreeTrial = cooperation.IsFreeTrial
    };
}