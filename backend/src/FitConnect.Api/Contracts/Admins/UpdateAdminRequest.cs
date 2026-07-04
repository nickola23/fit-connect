namespace FitConnect.Api.Contracts.Admins;

public class UpdateAdminRequest
{
    public required string Name { get; init; }
    public string Language { get; init; } = "sr";
}