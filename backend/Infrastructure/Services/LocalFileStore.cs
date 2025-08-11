using IntranetStarter.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Infrastructure.Services;

public class LocalFileStore : IFileStore {
    private readonly string                  _basePath;
    private readonly ILogger<LocalFileStore> _logger;

    public LocalFileStore(IConfiguration configuration, ILogger<LocalFileStore> logger) {
        _basePath = configuration["FileStorage:LocalPath"] ?? Path.Combine(Directory.GetCurrentDirectory(), "uploads");
        _logger   = logger;

        // Ensure directory exists
        Directory.CreateDirectory(_basePath);
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default) {
        try {
            string uniqueFileName = GenerateUniqueFileName(fileName);
            string filePath       = Path.Combine(_basePath, uniqueFileName);

            await using var fileStreamWriter = new FileStream(filePath, FileMode.Create);
            await fileStream.CopyToAsync(fileStreamWriter, cancellationToken);

            _logger.LogInformation("File saved to local storage: {FileName}", uniqueFileName);
            return uniqueFileName;
        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error saving file to local storage: {FileName}", fileName);
            throw new FileStoreException($"Failed to save file: {fileName}", ex);
        }
    }

    public async Task<Stream> GetFileAsync(string fileName, CancellationToken cancellationToken = default) {
        try {
            string filePath = Path.Combine(_basePath, fileName);

            if (!File.Exists(filePath))
                throw new FileNotFoundException($"File not found: {fileName}");

            var fileStream = new FileStream(filePath, FileMode.Open, FileAccess.Read);
            return await Task.FromResult(fileStream);
        }
        catch (Exception ex) when (ex is not FileNotFoundException) {
            _logger.LogError(ex, "Error retrieving file from local storage: {FileName}", fileName);
            throw new FileStoreException($"Failed to retrieve file: {fileName}", ex);
        }
    }

    public async Task<bool> DeleteFileAsync(string fileName, CancellationToken cancellationToken = default) {
        try {
            string filePath = Path.Combine(_basePath, fileName);

            if (!File.Exists(filePath)) 
                return await Task.FromResult(false);
            
            File.Delete(filePath);
            _logger.LogInformation("File deleted from local storage: {FileName}", fileName);
            return await Task.FromResult(true);

        }
        catch (Exception ex) {
            _logger.LogError(ex, "Error deleting file from local storage: {FileName}", fileName);
            throw new FileStoreException($"Failed to delete file: {fileName}", ex);
        }
    }

    public async Task<string> GetFileUrlAsync(string fileName, TimeSpan expiry, CancellationToken cancellationToken = default) {
        // For local file store, return a simple path-based URL
        // In a real application, you might want to create a controller endpoint to serve files
        return await Task.FromResult($"/api/files/{fileName}");
    }

    public async Task<bool> FileExistsAsync(string fileName, CancellationToken cancellationToken = default) {
        string filePath = Path.Combine(_basePath, fileName);
        return await Task.FromResult(File.Exists(filePath));
    }

    private static string GenerateUniqueFileName(string originalFileName) {
        string extension            = Path.GetExtension(originalFileName);
        string nameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);
        string timestamp            = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        string uniqueId             = Guid.NewGuid().ToString("N")[..8];

        return $"{nameWithoutExtension}_{timestamp}_{uniqueId}{extension}";
    }
}