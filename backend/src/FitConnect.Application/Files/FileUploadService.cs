using FitConnect.Application.Common;
using FitConnect.Domain.Enums;
using FitConnect.Domain.Exceptions.Files;

namespace FitConnect.Application.Files;

public class FileUploadService
{
    private static readonly IReadOnlyDictionary<FileCategory, (string[] Extensions, long MaxSizeBytes)> Policies =
        new Dictionary<FileCategory, (string[], long)>
        {
            [FileCategory.Credentials] = (new[] { ".pdf", ".jpg", ".jpeg", ".png" }, 10 * 1024 * 1024),
            [FileCategory.ExerciseDemoVideos] = (new[] { ".mp4", ".mov", ".webm" }, 200 * 1024 * 1024)
        };

    private readonly IFileStorage fileStorage;

    public FileUploadService(IFileStorage fileStorage)
    {
        this.fileStorage = fileStorage;
    }

    public async Task<string> UploadAsync(
        Stream content, string originalFileName, long contentLength, FileCategory category, CancellationToken cancellationToken = default)
    {
        var policy = Policies[category];
        var extension = Path.GetExtension(originalFileName).ToLowerInvariant();

        if (!policy.Extensions.Contains(extension))
        {
            throw new UnsupportedFileTypeException(extension, policy.Extensions);
        }

        if (contentLength > policy.MaxSizeBytes)
        {
            throw new FileTooLargeException(policy.MaxSizeBytes);
        }

        return await fileStorage.SaveAsync(content, originalFileName, category, cancellationToken);
    }
}