using FitConnect.Domain.Payments;

namespace FitConnect.Application.Payments;

public interface IPaymentRepository
{
    Task<IReadOnlyList<Payment>> GetForCooperationAsync(Guid cooperationId, CancellationToken cancellationToken = default);
    Task<Payment> CreateAsync(Payment payment, CancellationToken cancellationToken = default);
}