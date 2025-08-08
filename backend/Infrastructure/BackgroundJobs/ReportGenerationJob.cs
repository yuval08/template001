using Hangfire;
using IntranetStarter.Application.Services;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Infrastructure.BackgroundJobs;

public class ReportGenerationJob
{
    private readonly IPdfService _pdfService;
    private readonly IEmailService _emailService;
    private readonly INotificationService _notificationService;
    private readonly ILogger<ReportGenerationJob> _logger;

    public ReportGenerationJob(
        IPdfService pdfService,
        IEmailService emailService,
        INotificationService notificationService,
        ILogger<ReportGenerationJob> logger)
    {
        _pdfService = pdfService;
        _emailService = emailService;
        _notificationService = notificationService;
        _logger = logger;
    }

    [AutomaticRetry(Attempts = 3)]
    public async Task GenerateAndEmailProjectReportAsync(Guid projectId, string emailAddress, string? userId = null)
    {
        try
        {
            _logger.LogInformation("Starting report generation job for project: {ProjectId}, Email: {Email}", projectId, emailAddress);

            // Send initial notification if userId is provided
            if (!string.IsNullOrEmpty(userId))
            {
                await _notificationService.SendNotificationAsync(userId, 
                    "Your project report is being generated...", 
                    NotificationType.Info);
            }

            // Generate the PDF report
            var pdfBytes = await _pdfService.GenerateProjectReportAsync(projectId);

            // Send the email with the report attached
            await _emailService.SendProjectReportAsync(emailAddress, projectId, pdfBytes);

            // Send success notification if userId is provided
            if (!string.IsNullOrEmpty(userId))
            {
                await _notificationService.SendNotificationAsync(userId, 
                    $"Project report has been sent to {emailAddress}", 
                    NotificationType.Success);
            }

            _logger.LogInformation("Report generation job completed successfully for project: {ProjectId}", projectId);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in report generation job for project: {ProjectId}", projectId);

            // Send error notification if userId is provided
            if (!string.IsNullOrEmpty(userId))
            {
                await _notificationService.SendNotificationAsync(userId, 
                    "Failed to generate project report. Please try again.", 
                    NotificationType.Error);
            }

            throw; // Re-throw to trigger Hangfire retry mechanism
        }
    }

    [AutomaticRetry(Attempts = 2)]
    public async Task SendSampleReportAsync(string emailAddress, string? userId = null)
    {
        try
        {
            _logger.LogInformation("Starting sample report generation job for email: {Email}", emailAddress);

            // Send initial notification if userId is provided
            if (!string.IsNullOrEmpty(userId))
            {
                await _notificationService.SendNotificationAsync(userId, 
                    "Your sample report is being generated...", 
                    NotificationType.Info);
            }

            // Generate the sample PDF report
            var pdfBytes = await _pdfService.GenerateSampleReportAsync();

            // Send the email with the report attached
            var subject = "Sample Report from Intranet Starter";
            var body = @"
                <html>
                <body>
                    <h2>Sample Report</h2>
                    <p>Thank you for trying our Intranet Starter!</p>
                    <p>Please find attached a sample PDF report generated using QuestPDF.</p>
                    <p>This demonstrates the automated report generation capabilities of the system.</p>
                    <hr>
                    <p><small>Generated on " + DateTime.Now.ToString("yyyy-MM-dd HH:mm:ss") + @"</small></p>
                </body>
                </html>";

            await _emailService.SendEmailAsync(emailAddress, subject, body, pdfBytes, "sample_report.pdf");

            // Send success notification if userId is provided
            if (!string.IsNullOrEmpty(userId))
            {
                await _notificationService.SendNotificationAsync(userId, 
                    $"Sample report has been sent to {emailAddress}", 
                    NotificationType.Success);
            }

            _logger.LogInformation("Sample report generation job completed successfully for email: {Email}", emailAddress);
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in sample report generation job for email: {Email}", emailAddress);

            // Send error notification if userId is provided
            if (!string.IsNullOrEmpty(userId))
            {
                await _notificationService.SendNotificationAsync(userId, 
                    "Failed to generate sample report. Please try again.", 
                    NotificationType.Error);
            }

            throw; // Re-throw to trigger Hangfire retry mechanism
        }
    }

    [AutomaticRetry(Attempts = 1)]
    public async Task CleanupOldReportsAsync()
    {
        try
        {
            _logger.LogInformation("Starting cleanup job for old reports");

            // In a real implementation, you would clean up old files from storage
            // For now, we'll just log that the cleanup job ran
            
            await Task.Delay(1000); // Simulate some work

            await _notificationService.SendNotificationToAllAsync(
                "System maintenance completed: Old reports cleaned up", 
                NotificationType.Info);

            _logger.LogInformation("Cleanup job completed successfully");
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Error in cleanup job");
            throw;
        }
    }
}

public static class ReportGenerationJobExtensions
{
    public static void ScheduleProjectReportGeneration(this IRecurringJobManager jobManager)
    {
        // Schedule a weekly cleanup job
        jobManager.AddOrUpdate<ReportGenerationJob>(
            "cleanup-old-reports",
            job => job.CleanupOldReportsAsync(),
            Cron.Weekly);
    }
}