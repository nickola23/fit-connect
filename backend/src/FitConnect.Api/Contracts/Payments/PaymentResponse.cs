using FitConnect.Domain.Payments;

namespace FitConnect.Api.Contracts.Payments;

public class PaymentResponse
{
    public required Guid Id { get; init; }
    public required Guid CooperationId { get; init; }
    public required DateOnly PaymentDate { get; init; }
    public required decimal Amount { get; init; }

    public static PaymentResponse FromDomain(Payment payment) => new()
    {
        Id = payment.Id,
        CooperationId = payment.CooperationId,
        PaymentDate = payment.PaymentDate,
        Amount = payment.Amount
    };
}