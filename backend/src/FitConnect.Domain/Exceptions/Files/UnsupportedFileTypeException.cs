namespace FitConnect.Domain.Exceptions.Files;

public class UnsupportedFileTypeException : Exception
{
    public UnsupportedFileTypeException(string extension, IEnumerable<string> allowedExtensions)
        : base($"File type '{extension}' is not supported. Allowed types: {string.Join(", ", allowedExtensions)}.")
    {
    }
}