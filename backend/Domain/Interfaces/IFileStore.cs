namespace IntranetStarter.Domain.Interfaces;

public interface IFileStore
{
    Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default);
    Task<Stream> GetFileAsync(string fileName, CancellationToken cancellationToken = default);
    Task<bool> DeleteFileAsync(string fileName, CancellationToken cancellationToken = default);
    Task<string> GetFileUrlAsync(string fileName, TimeSpan expiry, CancellationToken cancellationToken = default);
    Task<bool> FileExistsAsync(string fileName, CancellationToken cancellationToken = default);
}

public class FileStoreException : Exception
{
    public FileStoreException(string message) : base(message) { }
    public FileStoreException(string message, Exception innerException) : base(message, innerException) { }
}