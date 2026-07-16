using FitConnect.Application.Common;
using FitConnect.Domain.Enums;
using Microsoft.Extensions.Options;

namespace FitConnect.Infrastructure.Storage;

public class LocalFileStorage : IFileStorage
{
    private readonly FileStorageOptions options;

    public LocalFileStorage(IOptions<FileStorageOptions> options)
    {
        this.options = options.Value;
    }

    public async Task<string> SaveAsync(Stream content, string originalFileName, FileCategory category, CancellationToken cancellationToken = default)
    {
        var folderName = FolderNameFor(category);
        var folderPath = Path.Combine(options.RootPath, folderName);
        Directory.CreateDirectory(folderPath);

        var extension = Path.GetExtension(originalFileName);
        var storedFileName = $"{Guid.NewGuid()}{extension}";
        var fullPath = Path.Combine(folderPath, storedFileName);

        await using (var fileStream = new FileStream(fullPath, FileMode.CreateNew, FileAccess.Write))
        {
            await content.CopyToAsync(fileStream, cancellationToken);
        }

        return $"{options.PublicPathPrefix.TrimEnd('/')}/{folderName}/{storedFileName}";
    }

    private static string FolderNameFor(FileCategory category) => category switch
    {
        FileCategory.Credentials => "credentials",
        FileCategory.ExerciseDemoVideos => "exercise-demo-videos",
        _ => throw new ArgumentOutOfRangeException(nameof(category), category, "Unknown file category.")
    };
}