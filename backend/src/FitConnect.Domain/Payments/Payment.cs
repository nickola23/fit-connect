namespace FitConnect.Domain.Payments;

public class Payment
{
    public Guid Id { get; }
    public Guid CooperationId { get; }
    public DateOnly PaymentDate { get; }
    public decimal Amount { get; }

    public Payment(Guid id, Guid cooperationId, DateOnly paymentDate, decimal amount)
    {
        if (amount < 0)
        {
            throw new ArgumentOutOfRangeException(nameof(amount), "Payment amount cannot be negative.");
        }

        Id = id;
        CooperationId = cooperationId;
        PaymentDate = paymentDate;
        Amount = amount;
    }
}