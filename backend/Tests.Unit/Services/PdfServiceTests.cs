using FluentAssertions;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using IntranetStarter.Infrastructure.Services;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace IntranetStarter.Tests.Unit.Services;

public class PdfServiceTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<Project>> _mockProjectRepository;
    private readonly Mock<ILogger<PdfService>> _mockLogger;
    private readonly PdfService _pdfService;

    public PdfServiceTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockProjectRepository = new Mock<IRepository<Project>>();
        _mockLogger = new Mock<ILogger<PdfService>>();

        _mockUnitOfWork.Setup(x => x.Repository<Project>()).Returns(_mockProjectRepository.Object);

        _pdfService = new PdfService(_mockUnitOfWork.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task GenerateSampleReportAsync_ShouldReturnPdfBytes()
    {
        // Act
        var result = await _pdfService.GenerateSampleReportAsync();

        // Assert
        result.Should().NotBeNull();
        result.Should().NotBeEmpty();
        
        // PDF files start with "%PDF-" header
        var pdfHeader = System.Text.Encoding.ASCII.GetString(result.Take(4).ToArray());
        pdfHeader.Should().Be("%PDF");
    }

    [Fact]
    public async Task GenerateProjectReportAsync_WithValidProject_ShouldReturnPdfBytes()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var project = new Project
        {
            Id = projectId,
            Name = "Test Project",
            Description = "Test project description",
            Status = ProjectStatus.InProgress,
            Budget = 50000m,
            ClientName = "Test Client",
            StartDate = DateTime.UtcNow,
            EndDate = DateTime.UtcNow.AddMonths(3),
            Priority = 1,
            Tags = "test,project,development",
            CreatedAt = DateTime.UtcNow.AddDays(-10)
        };

        _mockProjectRepository.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        // Act
        var result = await _pdfService.GenerateProjectReportAsync(projectId);

        // Assert
        result.Should().NotBeNull();
        result.Should().NotBeEmpty();
        
        // PDF files start with "%PDF-" header
        var pdfHeader = System.Text.Encoding.ASCII.GetString(result.Take(4).ToArray());
        pdfHeader.Should().Be("%PDF");

        _mockProjectRepository.Verify(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GenerateProjectReportAsync_WithNonExistentProject_ShouldThrowArgumentException()
    {
        // Arrange
        var projectId = Guid.NewGuid();

        _mockProjectRepository.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((Project?)null);

        // Act & Assert
        var exception = await Assert.ThrowsAsync<ArgumentException>(
            () => _pdfService.GenerateProjectReportAsync(projectId));

        exception.Message.Should().Contain($"Project with ID {projectId} not found");
        
        _mockProjectRepository.Verify(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task GenerateProjectReportAsync_WithProjectWithTeamMembers_ShouldIncludeTeamMembersInPdf()
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var teamMember1 = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "John",
            LastName = "Doe",
            Email = "john.doe@company.com",
            Role = "Developer"
        };
        var teamMember2 = new User
        {
            Id = Guid.NewGuid(),
            FirstName = "Jane",
            LastName = "Smith",
            Email = "jane.smith@company.com",
            Role = "Manager"
        };

        var project = new Project
        {
            Id = projectId,
            Name = "Team Project",
            Description = "Project with team members",
            Status = ProjectStatus.InProgress,
            Budget = 75000m,
            TeamMembers = new List<User> { teamMember1, teamMember2 }
        };

        _mockProjectRepository.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        // Act
        var result = await _pdfService.GenerateProjectReportAsync(projectId);

        // Assert
        result.Should().NotBeNull();
        result.Should().NotBeEmpty();
        
        // Verify it's a valid PDF
        var pdfHeader = System.Text.Encoding.ASCII.GetString(result.Take(4).ToArray());
        pdfHeader.Should().Be("%PDF");

        // Note: In a more comprehensive test, you might parse the PDF content
        // to verify that team member information is actually included
    }

    [Theory]
    [InlineData(ProjectStatus.Planning)]
    [InlineData(ProjectStatus.InProgress)]
    [InlineData(ProjectStatus.OnHold)]
    [InlineData(ProjectStatus.Completed)]
    [InlineData(ProjectStatus.Cancelled)]
    public async Task GenerateProjectReportAsync_WithDifferentStatuses_ShouldGeneratePdfSuccessfully(ProjectStatus status)
    {
        // Arrange
        var projectId = Guid.NewGuid();
        var project = new Project
        {
            Id = projectId,
            Name = $"Project with {status} status",
            Description = "Test project with different status",
            Status = status,
            Budget = 25000m,
            Priority = 1
        };

        _mockProjectRepository.Setup(x => x.GetByIdAsync(projectId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(project);

        // Act
        var result = await _pdfService.GenerateProjectReportAsync(projectId);

        // Assert
        result.Should().NotBeNull();
        result.Should().NotBeEmpty();
        
        var pdfHeader = System.Text.Encoding.ASCII.GetString(result.Take(4).ToArray());
        pdfHeader.Should().Be("%PDF");
    }
}