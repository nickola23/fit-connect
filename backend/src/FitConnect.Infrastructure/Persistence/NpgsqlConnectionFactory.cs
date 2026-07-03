using System.Data.Common;
using Microsoft.Extensions.Configuration;
using Npgsql;
using FitConnect.Application.Common;

namespace FitConnect.Infrastructure.Persistence;

public class NpgsqlConnectionFactory : IDbConnectionFactory
{
    private readonly string connectionString;

    public NpgsqlConnectionFactory(IConfiguration configuration)
    {
        connectionString = configuration.GetConnectionString("DefaultConnection")
            ?? throw new InvalidOperationException("Connection string 'DefaultConnection' is not configured.");
    }

    public async Task<DbConnection> CreateOpenConnectionAsync(CancellationToken cancellationToken = default)
    {
        var connection = new NpgsqlConnection(connectionString);
        await connection.OpenAsync(cancellationToken);
        return connection;
    }
}