using Amazon.S3;
using Amazon.S3.Model;
using IntranetStarter.Domain.Interfaces;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Infrastructure.Services;

public class S3FileStore : IFileStore
{
    private readonly IAmazonS3 _s3Client;
    private readonly string _bucketName;
    private readonly ILogger<S3FileStore> _logger;

    public S3FileStore(IConfiguration configuration, ILogger<S3FileStore> logger)
    {
        _bucketName = configuration["FileStorage:S3:BucketName"] ?? throw new ArgumentException("S3 bucket name is required");
        _logger = logger;

        var config = new AmazonS3Config();
        
        var region = configuration["FileStorage:S3:Region"];
        if (!string.IsNullOrEmpty(region))
        {
            config.RegionEndpoint = Amazon.RegionEndpoint.GetBySystemName(region);
        }

        var serviceUrl = configuration["FileStorage:S3:ServiceUrl"];
        if (!string.IsNullOrEmpty(serviceUrl))
        {
            config.ServiceURL = serviceUrl;
            config.ForcePathStyle = true; // Required for MinIO and some S3-compatible services
        }

        _s3Client = new AmazonS3Client(config);
    }

    public async Task<string> SaveFileAsync(Stream fileStream, string fileName, string contentType, CancellationToken cancellationToken = default)
    {
        try
        {
            var key = GenerateUniqueFileName(fileName);
            
            var request = new PutObjectRequest
            {
                BucketName = _bucketName,
                Key = key,
                InputStream = fileStream,
                ContentType = contentType,
                ServerSideEncryptionMethod = ServerSideEncryptionMethod.AES256
            };

            await _s3Client.PutObjectAsync(request, cancellationToken);
            
            _logger.LogInformation("File uploaded to S3: {Key}", key);
            return key;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error uploading file to S3: {FileName}", fileName);
            throw new FileStoreException($"Failed to upload file to S3: {fileName}", ex);
        }
    }

    public async Task<Stream> GetFileAsync(string fileName, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new GetObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName
            };

            var response = await _s3Client.GetObjectAsync(request, cancellationToken);
            return response.ResponseStream;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            throw new FileNotFoundException($"File not found in S3: {fileName}");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error retrieving file from S3: {FileName}", fileName);
            throw new FileStoreException($"Failed to retrieve file from S3: {fileName}", ex);
        }
    }

    public async Task<bool> DeleteFileAsync(string fileName, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new DeleteObjectRequest
            {
                BucketName = _bucketName,
                Key = fileName
            };

            await _s3Client.DeleteObjectAsync(request, cancellationToken);
            
            _logger.LogInformation("File deleted from S3: {Key}", fileName);
            return true;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error deleting file from S3: {FileName}", fileName);
            throw new FileStoreException($"Failed to delete file from S3: {fileName}", ex);
        }
    }

    public async Task<string> GetFileUrlAsync(string fileName, TimeSpan expiry, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new GetPreSignedUrlRequest
            {
                BucketName = _bucketName,
                Key = fileName,
                Expires = DateTime.UtcNow.Add(expiry),
                Verb = HttpVerb.GET
            };

            var url = await _s3Client.GetPreSignedURLAsync(request);
            return url;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error generating presigned URL for S3 file: {FileName}", fileName);
            throw new FileStoreException($"Failed to generate presigned URL for S3 file: {fileName}", ex);
        }
    }

    public async Task<bool> FileExistsAsync(string fileName, CancellationToken cancellationToken = default)
    {
        try
        {
            var request = new GetObjectMetadataRequest
            {
                BucketName = _bucketName,
                Key = fileName
            };

            await _s3Client.GetObjectMetadataAsync(request, cancellationToken);
            return true;
        }
        catch (AmazonS3Exception ex) when (ex.StatusCode == System.Net.HttpStatusCode.NotFound)
        {
            return false;
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error checking if file exists in S3: {FileName}", fileName);
            throw new FileStoreException($"Failed to check if file exists in S3: {fileName}", ex);
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

    public void Dispose()
    {
        _s3Client?.Dispose();
    }
}