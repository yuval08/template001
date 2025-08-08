using IntranetStarter.Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IntranetStarter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class FilesController(IFileStore fileStore, ILogger<FilesController> logger) : ControllerBase {
    /// <summary>
    /// Upload a file
    /// </summary>
    /// <param name="file">File to upload</param>
    /// <returns>File information</returns>
    [HttpPost("upload")]
    public async Task<ActionResult<object>> UploadFile(IFormFile file) {
        try {
            if (file == null || file.Length == 0)
                return BadRequest("No file provided");

            // Validate file size (10MB max)
            const long maxFileSize = 10 * 1024 * 1024;
            if (file.Length > maxFileSize)
                return BadRequest("File size exceeds 10MB limit");

            // Validate file type (basic validation)
            var allowedTypes = new[] {
                "image/jpeg", "image/png", "image/gif", "image/webp",
                "application/pdf", "application/msword",
                "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
                "text/plain", "text/csv"
            };

            if (!allowedTypes.Contains(file.ContentType))
                return BadRequest("File type not allowed");

            using var stream   = file.OpenReadStream();
            var       fileName = await fileStore.SaveFileAsync(stream, file.FileName, file.ContentType);

            logger.LogInformation("File uploaded successfully: {FileName} -> {StoredFileName}",
                file.FileName, fileName);

            return Ok(new {
                FileName         = fileName,
                OriginalFileName = file.FileName,
                Size             = file.Length,
                ContentType      = file.ContentType,
                UploadedAt       = DateTime.UtcNow
            });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error uploading file: {FileName}", file.FileName);
            return StatusCode(500, "An error occurred while uploading the file");
        }
    }

    /// <summary>
    /// Download a file
    /// </summary>
    /// <param name="fileName">Name of the file to download</param>
    /// <returns>File stream</returns>
    [HttpGet("{fileName}")]
    public async Task<ActionResult> DownloadFile(string fileName) {
        try {
            if (string.IsNullOrEmpty(fileName))
                return BadRequest("File name is required");

            var exists = await fileStore.FileExistsAsync(fileName);
            if (!exists)
                return NotFound("File not found");

            var fileStream = await fileStore.GetFileAsync(fileName);

            // Determine content type based on file extension
            var contentType = GetContentType(fileName);

            return File(fileStream, contentType, fileName);
        }
        catch (FileNotFoundException) {
            return NotFound("File not found");
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error downloading file: {FileName}", fileName);
            return StatusCode(500, "An error occurred while downloading the file");
        }
    }

    /// <summary>
    /// Get a temporary download URL for a file
    /// </summary>
    /// <param name="fileName">Name of the file</param>
    /// <param name="expiryHours">Hours until the URL expires (default: 1)</param>
    /// <returns>Temporary download URL</returns>
    [HttpGet("{fileName}/url")]
    public async Task<ActionResult<object>> GetFileUrl(string fileName, [FromQuery] int expiryHours = 1) {
        try {
            if (string.IsNullOrEmpty(fileName))
                return BadRequest("File name is required");

            if (expiryHours < 1 || expiryHours > 24)
                return BadRequest("Expiry hours must be between 1 and 24");

            var exists = await fileStore.FileExistsAsync(fileName);
            if (!exists)
                return NotFound("File not found");

            var expiry = TimeSpan.FromHours(expiryHours);
            var url    = await fileStore.GetFileUrlAsync(fileName, expiry);

            return Ok(new {
                Url       = url,
                FileName  = fileName,
                ExpiresAt = DateTime.UtcNow.Add(expiry)
            });
        }
        catch (FileNotFoundException) {
            return NotFound("File not found");
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error generating file URL: {FileName}", fileName);
            return StatusCode(500, "An error occurred while generating the file URL");
        }
    }

    /// <summary>
    /// Delete a file
    /// </summary>
    /// <param name="fileName">Name of the file to delete</param>
    /// <returns>Success status</returns>
    [HttpDelete("{fileName}")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult> DeleteFile(string fileName) {
        try {
            if (string.IsNullOrEmpty(fileName))
                return BadRequest("File name is required");

            var deleted = await fileStore.DeleteFileAsync(fileName);

            if (!deleted)
                return NotFound("File not found");

            logger.LogInformation("File deleted successfully: {FileName}", fileName);

            return NoContent();
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error deleting file: {FileName}", fileName);
            return StatusCode(500, "An error occurred while deleting the file");
        }
    }

    /// <summary>
    /// Check if a file exists
    /// </summary>
    /// <param name="fileName">Name of the file to check</param>
    /// <returns>Existence status</returns>
    [HttpHead("{fileName}")]
    public async Task<ActionResult> FileExists(string fileName) {
        try {
            if (string.IsNullOrEmpty(fileName))
                return BadRequest();

            var exists = await fileStore.FileExistsAsync(fileName);

            return exists ? Ok() : NotFound();
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error checking file existence: {FileName}", fileName);
            return StatusCode(500);
        }
    }

    private static string GetContentType(string fileName) {
        var extension = Path.GetExtension(fileName).ToLowerInvariant();
        return extension switch {
            ".jpg" or ".jpeg" => "image/jpeg",
            ".png"            => "image/png",
            ".gif"            => "image/gif",
            ".webp"           => "image/webp",
            ".pdf"            => "application/pdf",
            ".doc"            => "application/msword",
            ".docx"           => "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            ".txt"            => "text/plain",
            ".csv"            => "text/csv",
            _                 => "application/octet-stream"
        };
    }
}