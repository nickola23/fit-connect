using FitConnect.Application.Cooperations;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Exceptions;
using FitConnect.Domain.Exceptions.Payments;
using FitConnect.Domain.Payments;

namespace FitConnect.Application.Payments;

public class PaymentService
{
    private readonly IPaymentRepository paymentRepository;
    private readonly ICooperationRepository cooperationRepository;
    private readonly IPricingTierRepository pricingTierRepository;

    public PaymentService(IPaymentRepository paymentRepository, ICooperationRepository cooperationRepository, IPricingTierRepository pricingTierRepository)
    {
        this.paymentRepository = paymentRepository;
        this.cooperationRepository = cooperationRepository;
        this.pricingTierRepository = pricingTierRepository;
    }

    public Task<IReadOnlyList<Payment>> GetForCooperationAsync(Guid cooperationId, CancellationToken cancellationToken = default) =>
        paymentRepository.GetForCooperationAsync(cooperationId, cancellationToken);

    public async Task<Payment> RecordAsync(Guid cooperationId, CancellationToken cancellationToken = default)
    {
        var cooperation = await cooperationRepository.GetByIdAsync(cooperationId, cancellationToken)
            ?? throw new CooperationNotFoundException(cooperationId);

        if (cooperation.Status is not CooperationStatus.Accepted and not CooperationStatus.Active)
        {
            throw new CooperationNotEligibleForPaymentException(cooperationId);
        }

        if (cooperation.IsFreeTrial)
        {
            throw new FreeTrialCooperationCannotBePaidException(cooperationId);
        }

        var tier = await pricingTierRepository.GetByIdAsync(cooperation.PricingTierId!.Value, cancellationToken)
            ?? throw new PricingTierNotFoundException(cooperation.PricingTierId.Value);

        var payment = new Payment(Guid.NewGuid(), cooperationId, DateOnly.FromDateTime(DateTime.UtcNow), tier.MonthlyPrice);
        return await paymentRepository.CreateAsync(payment, cancellationToken);
    }
}