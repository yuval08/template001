using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using QuestPDF.Fluent;
using QuestPDF.Helpers;
using QuestPDF.Infrastructure;

namespace IntranetStarter.Infrastructure.Services;

public class PdfService(IUnitOfWork unitOfWork, ILogger<PdfService> logger) : IPdfService {
    static PdfService() {
        QuestPDF.Settings.License = LicenseType.Community;
    }

    public async Task<byte[]> GenerateProjectReportAsync(Guid projectId, CancellationToken cancellationToken = default) {
        try {
            logger.LogInformation("Generating PDF report for project: {ProjectId}", projectId);

            var project = await unitOfWork.Repository<Project>().GetByIdAsync(projectId, cancellationToken);

            if (project == null)
                throw new ArgumentException($"Project with ID {projectId} not found");

            var document = Document.Create(container => {
                container.Page(page => {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    page.Header()
                        .Text($"Project Report: {project.Name}")
                        .SemiBold().FontSize(20).FontColor(Colors.Blue.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(x => {
                            x.Item().Text($"Project Name: {project.Name}").FontSize(16).SemiBold();
                            x.Item().PaddingTop(10).Text($"Description: {project.Description}");
                            x.Item().PaddingTop(10).Text($"Status: {project.Status}");
                            x.Item().PaddingTop(10).Text($"Budget: ${project.Budget:N2}");

                            if (project.StartDate.HasValue)
                                x.Item().PaddingTop(10).Text($"Start Date: {project.StartDate.Value:yyyy-MM-dd}");

                            if (project.EndDate.HasValue)
                                x.Item().PaddingTop(10).Text($"End Date: {project.EndDate.Value:yyyy-MM-dd}");

                            if (!string.IsNullOrEmpty(project.ClientName))
                                x.Item().PaddingTop(10).Text($"Client: {project.ClientName}");

                            x.Item().PaddingTop(10).Text($"Priority: {project.Priority}");
                            x.Item().PaddingTop(10).Text($"Created: {project.CreatedAt:yyyy-MM-dd HH:mm}");

                            if (!string.IsNullOrEmpty(project.Tags)) {
                                x.Item().PaddingTop(20).Text("Tags:").SemiBold();
                                x.Item().PaddingTop(5).Text(project.Tags);
                            }

                            // Team members section
                            if (project.TeamMembers.Count == 0) 
                                return;
                            x.Item().PaddingTop(20).Text("Team Members:").SemiBold();
                            foreach (var member in project.TeamMembers) {
                                x.Item().PaddingTop(5).Text($"• {member.FullName} ({member.Role})");
                            }
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text(x => {
                            x.Span("Generated on ");
                            x.Span(DateTime.Now.ToString("yyyy-MM-dd HH:mm")).SemiBold();
                        });
                });
            });

            byte[] pdfBytes = document.GeneratePdf();

            logger.LogInformation("PDF report generated successfully for project: {ProjectId}, Size: {Size} bytes",
                projectId, pdfBytes.Length);

            return pdfBytes;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error generating PDF report for project: {ProjectId}", projectId);
            throw;
        }
    }

    public async Task<byte[]> GenerateSampleReportAsync(CancellationToken cancellationToken = default) {
        try {
            logger.LogInformation("Generating sample PDF report");

            var document = Document.Create(container => {
                container.Page(page => {
                    page.Size(PageSizes.A4);
                    page.Margin(2, Unit.Centimetre);
                    page.PageColor(Colors.White);
                    page.DefaultTextStyle(x => x.FontSize(12));

                    page.Header()
                        .Text("Sample Report")
                        .SemiBold().FontSize(24).FontColor(Colors.Blue.Medium);

                    page.Content()
                        .PaddingVertical(1, Unit.Centimetre)
                        .Column(x => {
                            x.Item().Text("Welcome to the Intranet Starter!").FontSize(18).SemiBold();

                            x.Item().PaddingTop(20).Text("This is a sample PDF report generated using QuestPDF.")
                                .FontSize(14);

                            x.Item().PaddingTop(20).Column(column => {
                                column.Item().Text("Features included:").SemiBold().FontSize(14);
                                column.Item().PaddingTop(10).Text("• Clean Architecture with Domain-Driven Design");
                                column.Item().PaddingTop(5).Text("• ASP.NET Core 9 with modern C# features");
                                column.Item().PaddingTop(5).Text("• Entity Framework Core with PostgreSQL");
                                column.Item().PaddingTop(5).Text("• Duende IdentityServer with OIDC support");
                                column.Item().PaddingTop(5).Text("• Multiple file storage options (Local, S3, Azure Blob)");
                                column.Item().PaddingTop(5).Text("• Hangfire for background job processing");
                                column.Item().PaddingTop(5).Text("• SignalR for real-time communications");
                                column.Item().PaddingTop(5).Text("• Comprehensive health checks");
                                column.Item().PaddingTop(5).Text("• Structured logging with Serilog");
                                column.Item().PaddingTop(5).Text("• API documentation with Swagger/OpenAPI");
                            });

                            x.Item().PaddingTop(30).Text("System Information").SemiBold().FontSize(16);
                            x.Item().PaddingTop(10).Text($"Generated on: {DateTime.Now:yyyy-MM-dd HH:mm:ss}");
                            x.Item().PaddingTop(5).Text($"Server: {Environment.MachineName}");
                            x.Item().PaddingTop(5).Text($"Runtime: {Environment.Version}");
                        });

                    page.Footer()
                        .AlignCenter()
                        .Text("Intranet Starter - Sample Report")
                        .FontSize(10).FontColor(Colors.Grey.Medium);
                });
            });

            byte[] pdfBytes = document.GeneratePdf();

            logger.LogInformation("Sample PDF report generated successfully, Size: {Size} bytes", pdfBytes.Length);

            return await Task.FromResult(pdfBytes);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error generating sample PDF report");
            throw;
        }
    }
}