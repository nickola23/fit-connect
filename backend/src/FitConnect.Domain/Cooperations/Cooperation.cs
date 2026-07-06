using FitConnect.Domain.Exceptions;

namespace FitConnect.Domain.Cooperations;

public class Cooperation
{
    public Guid Id { get; }
    public Guid TrainerId { get; }
    public Guid ClientId { get; }
    public Guid? PricingTierId { get; }
    public CooperationStatus Status { get; private set; }
    public DateTimeOffset RequestDate { get; }
    public DateOnly? StartDate { get; private set; }
    public DateOnly? EndDate { get; private set; }
    public bool IsFreeTrial { get; }

    public Cooperation(
        Guid id,
        Guid trainerId,
        Guid clientId,
        Guid? pricingTierId,
        CooperationStatus status,
        DateTimeOffset requestDate,
        DateOnly? startDate,
        DateOnly? endDate,
        bool isFreeTrial)
    {
        Id = id;
        TrainerId = trainerId;
        ClientId = clientId;
        PricingTierId = pricingTierId;
        Status = status;
        RequestDate = requestDate;
        StartDate = startDate;
        EndDate = endDate;
        IsFreeTrial = isFreeTrial;
    }

    public void Accept()
    {
        EnsureTransitionFrom(CooperationStatus.Pending, CooperationStatus.Accepted);
        Status = CooperationStatus.Accepted;
        StartDate = DateOnly.FromDateTime(DateTime.UtcNow);
    }

    public void Reject()
    {
        EnsureTransitionFrom(CooperationStatus.Pending, CooperationStatus.Rejected);
        Status = CooperationStatus.Rejected;
    }

    public void End()
    {
        if (Status is not CooperationStatus.Accepted and not CooperationStatus.Active)
        {
            throw new InvalidCooperationStatusTransitionException(Status, CooperationStatus.Ended);
        }

        Status = CooperationStatus.Ended;
        EndDate = DateOnly.FromDateTime(DateTime.UtcNow);
    }

    public bool IsMinimumDurationMet() =>
        StartDate is not null && DateOnly.FromDateTime(DateTime.UtcNow) >= StartDate.Value.AddMonths(1);

    private void EnsureTransitionFrom(CooperationStatus expectedCurrent, CooperationStatus target)
    {
        if (Status != expectedCurrent)
        {
            throw new InvalidCooperationStatusTransitionException(Status, target);
        }
    }
}