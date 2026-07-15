using System.Data.Common;
using FitConnect.Application.Common;
using FitConnect.Application.Payments;
using FitConnect.Domain.Payments;
using Npgsql;

namespace FitConnect.Infrastructure.Repositories;

public class PaymentRepository : IPaymentRepository
{
    private readonly IDbConnectionFactory connectionFactory;

    public PaymentRepository(IDbConnectionFactory connectionFactory)
    {
        this.connectionFactory = connectionFactory;
    }

    public async Task<IReadOnlyList<Payment>> GetForCooperationAsync(Guid cooperationId, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            SELECT id, cooperation_id, payment_date, amount
            FROM payments
            WHERE cooperation_id = @cooperationId
            ORDER BY payment_date DESC
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("cooperationId", cooperationId);

        await using var reader = await command.ExecuteReaderAsync(cancellationToken);
        var payments = new List<Payment>();
        while (await reader.ReadAsync(cancellationToken))
        {
            payments.Add(Map(reader));
        }

        return payments;
    }

    public async Task<Payment> CreateAsync(Payment payment, CancellationToken cancellationToken = default)
    {
        await using var connection = await connectionFactory.CreateOpenConnectionAsync(cancellationToken);

        const string sql = """
            INSERT INTO payments (id, cooperation_id, payment_date, amount)
            VALUES (@id, @cooperationId, @paymentDate, @amount)
            """;

        await using var command = CreateCommand(connection, sql);
        command.Parameters.AddWithValue("id", payment.Id);
        command.Parameters.AddWithValue("cooperationId", payment.CooperationId);
        command.Parameters.AddWithValue("paymentDate", payment.PaymentDate);
        command.Parameters.AddWithValue("amount", payment.Amount);
        await command.ExecuteNonQueryAsync(cancellationToken);

        return payment;
    }

    private static NpgsqlCommand CreateCommand(DbConnection connection, string sql)
    {
        var command = (NpgsqlCommand)connection.CreateCommand();
        command.CommandText = sql;
        return command;
    }

    private static Payment Map(DbDataReader reader) => new(
        reader.GetGuid(reader.GetOrdinal("id")),
        reader.GetGuid(reader.GetOrdinal("cooperation_id")),
        reader.GetFieldValue<DateOnly>(reader.GetOrdinal("payment_date")),
        reader.GetDecimal(reader.GetOrdinal("amount")));
}