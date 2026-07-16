using FitConnect.Domain.Enums;

namespace FitConnect.Application.Common;

public interface IFileStorage
{
    Task<string> SaveAsync(Stream content, string originalFileName, FileCategory category, CancellationToken cancellationToken = default);
}