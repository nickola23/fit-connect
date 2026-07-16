namespace FitConnect.Domain.Exceptions.Files;

public class FileTooLargeException : Exception
{
    public FileTooLargeException(long maxSizeBytes)
        : base($"File exceeds the maximum allowed size of {maxSizeBytes / (1024 * 1024)} MB.")
    {
    }
}