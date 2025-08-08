using Hangfire;
using IntranetStarter.Application.Services;
using IntranetStarter.Infrastructure.BackgroundJobs;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IntranetStarter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ReportsController(
    IPdfService                pdfService,
    IBackgroundJobClient       backgroundJobClient,
    ILogger<ReportsController> logger)
    : ControllerBase {
    /// <summary>
    /// Generate a sample PDF report
    /// </summary>
    /// <returns>PDF file</returns>
    [HttpGet("sample")]
    public async Task<ActionResult> GetSampleReport() {
        try {
            logger.LogInformation("Generating sample report for user: {User}", User.Identity?.Name);

            byte[] pdfBytes = await pdfService.GenerateSampleReportAsync();

            return File(pdfBytes, "application/pdf", "sample_report.pdf");
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error generating sample report");
            return StatusCode(500, "An error occurred while generating the sample report");
        }
    }

    /// <summary>
    /// Generate a project report
    /// </summary>
    /// <param name="projectId">Project ID</param>
    /// <returns>PDF file</returns>
    [HttpGet("project/{projectId:guid}")]
    public async Task<ActionResult> GetProjectReport(Guid projectId) {
        try {
            logger.LogInformation("Generating project report for project: {ProjectId}", projectId);

            byte[] pdfBytes = await pdfService.GenerateProjectReportAsync(projectId);

            return File(pdfBytes, "application/pdf", $"project_report_{projectId}.pdf");
        }
        catch (ArgumentException ex) {
            logger.LogWarning(ex, "Project not found: {ProjectId}", projectId);
            return NotFound(ex.Message);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error generating project report for project: {ProjectId}", projectId);
            return StatusCode(500, "An error occurred while generating the project report");
        }
    }

    /// <summary>
    /// Schedule a sample report to be generated and emailed
    /// </summary>
    /// <param name="request">Email request details</param>
    /// <returns>Job ID</returns>
    [HttpPost("sample/email")]
    public ActionResult<object> ScheduleSampleReportEmail([FromBody] EmailReportRequest request) {
        try {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string? userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;

            string? jobId = backgroundJobClient.Enqueue<ReportGenerationJob>(job => job.SendSampleReportAsync(request.Email, userId));

            logger.LogInformation("Sample report email job scheduled: {JobId} for {Email}", jobId, request.Email);

            return Ok(new { JobId = jobId, Message = "Sample report email has been scheduled" });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error scheduling sample report email");
            return StatusCode(500, "An error occurred while scheduling the email");
        }
    }

    /// <summary>
    /// Schedule a project report to be generated and emailed
    /// </summary>
    /// <param name="projectId">Project ID</param>
    /// <param name="request">Email request details</param>
    /// <returns>Job ID</returns>
    [HttpPost("project/{projectId:guid}/email")]
    public ActionResult<object> ScheduleProjectReportEmail(Guid projectId, [FromBody] EmailReportRequest request) {
        try {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string? userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;

            string? jobId = backgroundJobClient.Enqueue<ReportGenerationJob>(job => job.GenerateAndEmailProjectReportAsync(projectId, request.Email, userId));

            logger.LogInformation("Project report email job scheduled: {JobId} for project {ProjectId} to {Email}",
                jobId, projectId, request.Email);

            return Ok(new { JobId = jobId, Message = "Project report email has been scheduled" });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error scheduling project report email for project: {ProjectId}", projectId);
            return StatusCode(500, "An error occurred while scheduling the email");
        }
    }

    /// <summary>
    /// Schedule a delayed report generation (example of Hangfire delayed jobs)
    /// </summary>
    /// <param name="projectId">Project ID</param>
    /// <param name="request">Delayed email request</param>
    /// <returns>Job ID</returns>
    [HttpPost("project/{projectId:guid}/schedule")]
    public ActionResult<object> ScheduleDelayedProjectReport(Guid projectId, [FromBody] ScheduledEmailReportRequest request) {
        try {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            string? userId = User.FindFirst("sub")?.Value ?? User.FindFirst("id")?.Value;

            string? jobId = backgroundJobClient.Schedule<ReportGenerationJob>(
                job => job.GenerateAndEmailProjectReportAsync(projectId, request.Email, userId),
                request.ScheduledAt);

            logger.LogInformation("Delayed project report email job scheduled: {JobId} for project {ProjectId} at {ScheduledAt}",
                jobId, projectId, request.ScheduledAt);

            return Ok(new {
                JobId       = jobId,
                Message     = "Delayed project report email has been scheduled",
                ScheduledAt = request.ScheduledAt
            });
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error scheduling delayed project report email for project: {ProjectId}", projectId);
            return StatusCode(500, "An error occurred while scheduling the delayed email");
        }
    }
}

public record EmailReportRequest(string Email) {
    public string Email { get; init; } = Email;
}

public record ScheduledEmailReportRequest(string Email, DateTimeOffset ScheduledAt) {
    public string         Email       { get; init; } = Email;
    public DateTimeOffset ScheduledAt { get; init; } = ScheduledAt;
}