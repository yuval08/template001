namespace IntranetStarter.Application.Services;

public interface IPdfService
{
    Task<byte[]> GenerateProjectReportAsync(Guid projectId, CancellationToken cancellationToken = default);
    Task<byte[]> GenerateSampleReportAsync(CancellationToken cancellationToken = default);
}

public interface IEmailService
{
    Task SendEmailAsync(string to, string subject, string body, byte[]? attachment = null, string? attachmentName = null, CancellationToken cancellationToken = default);
    Task SendProjectReportAsync(string to, Guid projectId, byte[] pdfReport, CancellationToken cancellationToken = default);
}

public interface INotificationService
{
    Task SendNotificationAsync(string userId, string message, NotificationType type = NotificationType.Info, CancellationToken cancellationToken = default);
    Task SendNotificationToAllAsync(string message, NotificationType type = NotificationType.Info, CancellationToken cancellationToken = default);
}

public enum NotificationType
{
    Info,
    Success,
    Warning,
    Error
}