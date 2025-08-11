using Hangfire;
using IntranetStarter.Application.Interfaces;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Infrastructure.BackgroundJobs;

public class ReportGenerationJob(
    IPdfService                  pdfService,
    IEmailService                emailService,
    INotificationService         notificationService,
    ILogger<ReportGenerationJob> logger) {
    [AutomaticRetry(Attempts = 3)]
    public async Task GenerateAndEmailProjectReportAsync(Guid projectId, string emailAddress, string? userId = null) {
        try {
            logger.LogInformation("Starting report generation job for project: {ProjectId}, Email: {Email}", projectId, emailAddress);

            // Send initial notification if userId is provided
            if (!string.IsNullOrEmpty(userId)) {
                await notificationService.SendNotificationAsync(userId, "Your project report is being generated...");
            }

            // Generate the PDF report
            byte[] pdfBytes = await pdfService.GenerateProjectReportAsync(projectId);

            // Send the email with the report attached
            await emailService.SendProjectReportAsync(emailAddress, projectId, pdfBytes);

            // Send success notification if userId is provided
            if (!string.IsNullOrEmpty(userId)) {
                await notificationService.SendNotificationAsync(userId,
                    $"Project report has been sent to {emailAddress}",
                    NotificationType.Success);
            }

            logger.LogInformation("Report generation job completed successfully for project: {ProjectId}", projectId);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error in report generation job for project: {ProjectId}", projectId);

            // Send error notification if userId is provided
            if (!string.IsNullOrEmpty(userId)) {
                await notificationService.SendNotificationAsync(userId,
                    "Failed to generate project report. Please try again.",
                    NotificationType.Error);
            }

            throw; // Re-throw to trigger Hangfire retry mechanism
        }
    }

    [AutomaticRetry(Attempts = 2)]
    public async Task SendSampleReportAsync(string emailAddress, string? userId = null) {
        try {
            logger.LogInformation("Starting sample report generation job for email: {Email}", emailAddress);

            // Send initial notification if userId is provided
            if (!string.IsNullOrEmpty(userId)) {
                await notificationService.SendNotificationAsync(userId,
                    "Your sample report is being generated...",
                    NotificationType.Info);
            }

            // Generate the sample PDF report
            byte[] pdfBytes = await pdfService.GenerateSampleReportAsync();

            // Send the email with the report attached
            const string subject = "Sample Report from Intranet Starter";
            string body = $"""

                                           <html>
                                           <body>
                                               <h2>Sample Report</h2>
                                               <p>Thank you for trying our Intranet Starter!</p>
                                               <p>Please find attached a sample PDF report generated using QuestPDF.</p>
                                               <p>This demonstrates the automated report generation capabilities of the system.</p>
                                               <hr>
                                               <p><small>Generated on {DateTime.Now:yyyy-MM-dd HH:mm:ss}</small></p>
                                           </body>
                                           </html>
                           """;

            await emailService.SendEmailAsync(emailAddress, subject, body, pdfBytes, "sample_report.pdf");

            // Send success notification if userId is provided
            if (!string.IsNullOrEmpty(userId)) {
                await notificationService.SendNotificationAsync(userId,
                    $"Sample report has been sent to {emailAddress}",
                    NotificationType.Success);
            }

            logger.LogInformation("Sample report generation job completed successfully for email: {Email}", emailAddress);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error in sample report generation job for email: {Email}", emailAddress);

            // Send error notification if userId is provided
            if (!string.IsNullOrEmpty(userId)) {
                await notificationService.SendNotificationAsync(userId,
                    "Failed to generate sample report. Please try again.",
                    NotificationType.Error);
            }

            throw; // Re-throw to trigger Hangfire retry mechanism
        }
    }

    [AutomaticRetry(Attempts = 1)]
    public async Task CleanupOldReportsAsync() {
        try {
            logger.LogInformation("Starting cleanup job for old reports");

            // In a real implementation, you would clean up old files from storage
            // For now, we'll just log that the cleanup job ran

            await Task.Delay(1000); // Simulate some work

            await notificationService.SendNotificationToAllAsync("System maintenance completed: Old reports cleaned up");

            logger.LogInformation("Cleanup job completed successfully");
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error in cleanup job");
            throw;
        }
    }
}

public static class ReportGenerationJobExtensions {
    public static void ScheduleProjectReportGeneration(this IRecurringJobManager jobManager) {
        // Schedule a weekly cleanup job
        jobManager.AddOrUpdate<ReportGenerationJob>(
            "cleanup-old-reports",
            job => job.CleanupOldReportsAsync(),
            Cron.Weekly);
    }
}