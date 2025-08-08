using IntranetStarter.Application.Services;
using MailKit.Net.Smtp;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace IntranetStarter.Infrastructure.Services;

public class EmailService : IEmailService
{
    private readonly IConfiguration _configuration;
    private readonly ILogger<EmailService> _logger;

    public EmailService(IConfiguration configuration, ILogger<EmailService> logger)
    {
        _configuration = configuration;
        _logger = logger;
    }

    public async Task SendEmailAsync(string to, string subject, string body, byte[]? attachment = null, string? attachmentName = null, CancellationToken cancellationToken = default)
    {
        try
        {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                _configuration["Email:FromName"] ?? "Intranet Starter",
                _configuration["Email:FromAddress"] ?? "noreply@company.com"));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = body };

            if (attachment != null && !string.IsNullOrEmpty(attachmentName))
            {
                bodyBuilder.Attachments.Add(attachmentName, attachment);
            }

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();
            
            var host = _configuration["Email:SmtpHost"];
            var port = int.Parse(_configuration["Email:SmtpPort"] ?? "587");
            var username = _configuration["Email:Username"];
            var password = _configuration["Email:Password"];
            var useSsl = bool.Parse(_configuration["Email:UseSsl"] ?? "true");

            if (string.IsNullOrEmpty(host))
            {
                _logger.LogWarning("SMTP host not configured. Email will not be sent. Subject: {Subject}, To: {To}", subject, to);
                return;
            }

            await client.ConnectAsync(host, port, useSsl, cancellationToken);

            if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password))
            {
                await client.AuthenticateAsync(username, password, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            _logger.LogInformation("Email sent successfully. Subject: {Subject}, To: {To}", subject, to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending email. Subject: {Subject}, To: {To}", subject, to);
            throw;
        }
    }

    public async Task SendProjectReportAsync(string to, Guid projectId, byte[] pdfReport, CancellationToken cancellationToken = default)
    {
        try
        {
            var subject = $"Project Report - {projectId}";
            var body = $@"
                <html>
                <body>
                    <h2>Project Report</h2>
                    <p>Please find attached the project report for project ID: <strong>{projectId}</strong></p>
                    <p>This report was automatically generated on {DateTime.Now:yyyy-MM-dd HH:mm:ss}.</p>
                    <hr>
                    <p><small>This is an automated message from the Intranet Starter system.</small></p>
                </body>
                </html>";

            await SendEmailAsync(to, subject, body, pdfReport, $"project_report_{projectId}.pdf", cancellationToken);
            
            _logger.LogInformation("Project report email sent successfully. ProjectId: {ProjectId}, To: {To}", projectId, to);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error sending project report email. ProjectId: {ProjectId}, To: {To}", projectId, to);
            throw;
        }
    }
}