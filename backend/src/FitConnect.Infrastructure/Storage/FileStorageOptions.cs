namespace FitConnect.Infrastructure.Storage;

public class FileStorageOptions
{
    public required string RootPath { get; init; }
    public required string PublicPathPrefix { get; init; }
}