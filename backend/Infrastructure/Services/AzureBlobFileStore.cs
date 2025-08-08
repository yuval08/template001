using Azure.Storage.Blobs;
using Azure.Storage.Blobs.Models;
using Azure.Storage.Sas;
using IntranetStarter.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Infrastructure.Services;

public class AzureBlobFileStore : IFileStore
{
    private readonly BlobServiceClient _blobServiceClient;
    private readonly string _containerName;
    private readonly ILogger<AzureBlobFileStore> _logger;

    public AzureBlobFileStore(IConfiguration configuration, ILogger<AzureBlobFileStore> logger)
    {
        var connectionString = configuration["FileStorage:Azure:ConnectionString"] 
            ?? throw new ArgumentException("Azure Storage connection string is required");
        
        _containerName = configuration["FileStorage:Azure:ContainerName"] ?? "files";
        _logger = logger;

        _blobServiceClient = new BlobServiceClient(connectionString);
        
        // Ensure container exists
        EnsureContainerExists();
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        try
        {
            var blobName = GenerateUniqueFileName(fileName);
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(blobName);

            var options = new BlobUploadOptions
            {
                HttpHeaders = new BlobHttpHeaders { ContentType = contentType },
                Metadata = new Dictionary<string, string>
                {
                    { "OriginalFileName", fileName },
                    { "UploadedAt", DateTime.UtcNow.ToString("O") }
                }
            };

            await blobClient.UploadAsync(fileStream, options, cancellationToken);
            
            _logger.LogInformation("File uploaded to Azure Blob Storage: {BlobName}", blobName);
            return blobName;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to Azure Blob Storage: {FileName}", fileName);
            throw new FileStoreException($"Failed to upload file to Azure Blob Storage: {fileName}", ex);
        }
    }

    public async Task<Stream> GetFileAsync(string fileName, CancellationToken cancellationToken = default)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);

            if (!await blobClient.ExistsAsync(cancellationToken))
                throw new FileNotFoundException($"File not found in Azure Blob Storage: {fileName}");

            var response = await blobClient.DownloadStreamingAsync(cancellationToken: cancellationToken);
            return response.Value.Content;
        }
        catch (Exception ex) when (!(ex is FileNotFoundException))
        {
            _logger.LogError(ex, "Error retrieving file from Azure Blob Storage: {FileName}", fileName);
            throw new FileStoreException($"Failed to retrieve file from Azure Blob Storage: {fileName}", ex);
        }
    }

    public async Task<bool> DeleteFileAsync(string fileName, CancellationToken cancellationToken = default)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);

            var response = await blobClient.DeleteIfExistsAsync(DeleteSnapshotsOption.IncludeSnapshots, cancellationToken: cancellationToken);
            
            if (response.Value)
            {
                _logger.LogInformation("File deleted from Azure Blob Storage: {BlobName}", fileName);
            }
            
            return response.Value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from Azure Blob Storage: {FileName}", fileName);
            throw new FileStoreException($"Failed to delete file from Azure Blob Storage: {fileName}", ex);
        }
    }

    public async Task<string> GetFileUrlAsync(string fileName, TimeSpan expiry, CancellationToken cancellationToken = default)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);

            if (!await blobClient.ExistsAsync(cancellationToken))
                throw new FileNotFoundException($"File not found in Azure Blob Storage: {fileName}");

            if (blobClient.CanGenerateSasUri)
            {
                var sasBuilder = new BlobSasBuilder
                {
                    BlobContainerName = _containerName,
                    BlobName = fileName,
                    Resource = "b",
                    ExpiresOn = DateTimeOffset.UtcNow.Add(expiry)
                };
                sasBuilder.SetPermissions(BlobSasPermissions.Read);

                return blobClient.GenerateSasUri(sasBuilder).ToString();
            }
            else
            {
                // If SAS generation is not supported, return the blob URL (this would require public access)
                return blobClient.Uri.ToString();
            }
        }
        catch (Exception ex) when (!(ex is FileNotFoundException))
        {
            _logger.LogError(ex, "Error generating SAS URL for Azure Blob Storage file: {FileName}", fileName);
            throw new FileStoreException($"Failed to generate SAS URL for Azure Blob Storage file: {fileName}", ex);
        }
    }

    public async Task<bool> FileExistsAsync(string fileName, CancellationToken cancellationToken = default)
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            var blobClient = containerClient.GetBlobClient(fileName);

            var response = await blobClient.ExistsAsync(cancellationToken);
            return response.Value;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if file exists in Azure Blob Storage: {FileName}", fileName);
            throw new FileStoreException($"Failed to check if file exists in Azure Blob Storage: {fileName}", ex);
        }
    }

    private void EnsureContainerExists()
    {
        try
        {
            var containerClient = _blobServiceClient.GetBlobContainerClient(_containerName);
            containerClient.CreateIfNotExists(PublicAccessType.None);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error ensuring container exists: {ContainerName}", _containerName);
            throw;
        }
    }

    private static string GenerateUniqueFileName(string originalFileName)
    {
        var extension = Path.GetExtension(originalFileName);
        var nameWithoutExtension = Path.GetFileNameWithoutExtension(originalFileName);
        var timestamp = DateTime.UtcNow.ToString("yyyyMMddHHmmss");
        var uniqueId = Guid.NewGuid().ToString("N")[..8];
        
        return $"{nameWithoutExtension}_{timestamp}_{uniqueId}{extension}";
    }
}