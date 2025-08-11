namespace IntranetStarter.Application.Interfaces;

public interface IEmailService {
    Task SendEmailAsync(string         to, string subject,   string body,      byte[]?           attachment = null, string? attachmentName = null, CancellationToken cancellationToken = default);
    Task SendProjectReportAsync(string to, Guid   projectId, byte[] pdfReport, CancellationToken cancellationToken = default);
}