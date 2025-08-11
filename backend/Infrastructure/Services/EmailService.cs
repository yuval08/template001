using IntranetStarter.Application.Interfaces;
using MailKit.Net.Smtp;
using MailKit.Security;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using MimeKit;

namespace IntranetStarter.Infrastructure.Services;

public class EmailService(IConfiguration configuration, ILogger<EmailService> logger) : IEmailService {
    public async Task SendEmailAsync(string to, string subject, string body, byte[]? attachment = null, string? attachmentName = null, CancellationToken cancellationToken = default) {
        try {
            var message = new MimeMessage();
            message.From.Add(new MailboxAddress(
                configuration["Email:FromName"] ?? "Intranet Starter",
                configuration["Email:FromAddress"] ?? "noreply@company.com"));
            message.To.Add(new MailboxAddress("", to));
            message.Subject = subject;

            var bodyBuilder = new BodyBuilder { HtmlBody = body };

            if (attachment != null && !string.IsNullOrEmpty(attachmentName)) {
                bodyBuilder.Attachments.Add(attachmentName, attachment);
            }

            message.Body = bodyBuilder.ToMessageBody();

            using var client = new SmtpClient();

            string? host     = configuration["Email:SmtpHost"];
            int     port     = int.Parse(configuration["Email:SmtpPort"] ?? "587");
            string? username = configuration["Email:Username"];
            string? password = configuration["Email:Password"];
            bool    useSsl   = bool.Parse(configuration["Email:UseSsl"] ?? "true");

            if (string.IsNullOrEmpty(host)) {
                logger.LogWarning("SMTP host not configured. Email will not be sent. Subject: {Subject}, To: {To}", subject, to);
                return;
            }

            // Use STARTTLS for port 587, SSL for port 465
            var secureSocketOptions = port switch {
                587 => SecureSocketOptions.StartTls,
                465 => SecureSocketOptions.SslOnConnect,
                _ => useSsl ? SecureSocketOptions.Auto : SecureSocketOptions.None
            };
            
            await client.ConnectAsync(host, port, secureSocketOptions, cancellationToken);

            if (!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(password)) {
                await client.AuthenticateAsync(username, password, cancellationToken);
            }

            await client.SendAsync(message, cancellationToken);
            await client.DisconnectAsync(true, cancellationToken);

            logger.LogInformation("Email sent successfully. Subject: {Subject}, To: {To}", subject, to);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error sending email. Subject: {Subject}, To: {To}", subject, to);
            throw;
        }
    }

    public async Task SendProjectReportAsync(string to, Guid projectId, byte[] pdfReport, CancellationToken cancellationToken = default) {
        try {
            string subject = $"Project Report - {projectId}";
            string body = $"""

                                           <html>
                                           <body>
                                               <h2>Project Report</h2>
                                               <p>Please find attached the project report for project ID: <strong>{projectId}</strong></p>
                                               <p>This report was automatically generated on {DateTime.Now:yyyy-MM-dd HH:mm:ss}.</p>
                                               <hr>
                                               <p><small>This is an automated message from the Intranet Starter system.</small></p>
                                           </body>
                                           </html>
                           """;

            await SendEmailAsync(to, subject, body, pdfReport, $"project_report_{projectId}.pdf", cancellationToken);

            logger.LogInformation("Project report email sent successfully. ProjectId: {ProjectId}, To: {To}", projectId, to);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error sending project report email. ProjectId: {ProjectId}, To: {To}", projectId, to);
            throw;
        }
    }
}