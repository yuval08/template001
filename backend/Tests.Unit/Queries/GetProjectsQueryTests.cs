using FluentAssertions;
using IntranetStarter.Application.Queries;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace IntranetStarter.Tests.Unit.Queries;

public class GetProjectsQueryTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<Project>> _mockProjectRepository;
    private readonly Mock<ILogger<GetProjectsQueryHandler>> _mockLogger;
    private readonly GetProjectsQueryHandler _handler;

    public GetProjectsQueryTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockProjectRepository = new Mock<IRepository<Project>>();
        _mockLogger = new Mock<ILogger<GetProjectsQueryHandler>>();

        _mockUnitOfWork.Setup(x => x.Repository<Project>()).Returns(_mockProjectRepository.Object);

        _handler = new GetProjectsQueryHandler(_mockUnitOfWork.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task Handle_WithProjects_ShouldReturnProjectsResponse()
    {
        // Arrange
        var projects = new List<Project>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Project 1",
                Description = "Description 1",
                Status = ProjectStatus.InProgress,
                Budget = 10000m,
                Priority = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                TeamMembers = new List<User>()
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Project 2",
                Description = "Description 2",
                Status = ProjectStatus.Planning,
                Budget = 20000m,
                Priority = 2,
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                TeamMembers = new List<User>()
            }
        };

        var query = new GetProjectsQuery(Page: 1, PageSize: 10, Search: null);

        _mockProjectRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(projects);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Projects.Should().HaveCount(2);
        result.TotalCount.Should().Be(2);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(10);
        result.TotalPages.Should().Be(1);

        result.Projects.First().Name.Should().Be("Project 1");
        result.Projects.Last().Name.Should().Be("Project 2");

        _mockProjectRepository.Verify(x => x.GetAllAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_WithSearchFilter_ShouldReturnFilteredProjects()
    {
        // Arrange
        var projects = new List<Project>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Web Project",
                Description = "Web development project",
                Status = ProjectStatus.InProgress,
                Budget = 10000m,
                Priority = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                TeamMembers = new List<User>()
            },
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Mobile App",
                Description = "Mobile application development",
                Status = ProjectStatus.Planning,
                Budget = 20000m,
                Priority = 2,
                CreatedAt = DateTime.UtcNow.AddDays(-3),
                TeamMembers = new List<User>()
            }
        };

        var query = new GetProjectsQuery(Page: 1, PageSize: 10, Search: "Web");

        _mockProjectRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(projects);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Projects.Should().HaveCount(1);
        result.TotalCount.Should().Be(1);
        result.Projects.First().Name.Should().Be("Web Project");
    }

    [Fact]
    public async Task Handle_WithPagination_ShouldReturnCorrectPage()
    {
        // Arrange
        var projects = Enumerable.Range(1, 25)
            .Select(i => new Project
            {
                Id = Guid.NewGuid(),
                Name = $"Project {i}",
                Description = $"Description {i}",
                Status = ProjectStatus.InProgress,
                Budget = i * 1000m,
                Priority = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-i),
                TeamMembers = new List<User>()
            })
            .ToList();

        var query = new GetProjectsQuery(Page: 2, PageSize: 10, Search: null);

        _mockProjectRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(projects);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Projects.Should().HaveCount(10);
        result.TotalCount.Should().Be(25);
        result.Page.Should().Be(2);
        result.PageSize.Should().Be(10);
        result.TotalPages.Should().Be(3);

        // Should return projects 11-20 (second page)
        result.Projects.First().Name.Should().Be("Project 11");
        result.Projects.Last().Name.Should().Be("Project 20");
    }

    [Fact]
    public async Task Handle_EmptyRepository_ShouldReturnEmptyResponse()
    {
        // Arrange
        var projects = new List<Project>();
        var query = new GetProjectsQuery(Page: 1, PageSize: 10, Search: null);

        _mockProjectRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(projects);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Projects.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
        result.Page.Should().Be(1);
        result.PageSize.Should().Be(10);
        result.TotalPages.Should().Be(0);
    }

    [Fact]
    public async Task Handle_SearchNoMatches_ShouldReturnEmptyResponse()
    {
        // Arrange
        var projects = new List<Project>
        {
            new()
            {
                Id = Guid.NewGuid(),
                Name = "Project 1",
                Description = "Description 1",
                Status = ProjectStatus.InProgress,
                Budget = 10000m,
                Priority = 1,
                CreatedAt = DateTime.UtcNow.AddDays(-5),
                TeamMembers = new List<User>()
            }
        };

        var query = new GetProjectsQuery(Page: 1, PageSize: 10, Search: "NonExistentSearch");

        _mockProjectRepository.Setup(x => x.GetAllAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(projects);

        // Act
        var result = await _handler.Handle(query, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Projects.Should().BeEmpty();
        result.TotalCount.Should().Be(0);
        result.TotalPages.Should().Be(0);
    }
}