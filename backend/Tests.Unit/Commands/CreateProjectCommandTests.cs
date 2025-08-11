using FluentAssertions;
using IntranetStarter.Application.Features.Projects.Commands;
using IntranetStarter.Application.Features.Projects.DTOs;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using Microsoft.Extensions.Logging;
using Moq;
using Xunit;

namespace IntranetStarter.Tests.Unit.Commands;

public class CreateProjectCommandTests
{
    private readonly Mock<IUnitOfWork> _mockUnitOfWork;
    private readonly Mock<IRepository<Project>> _mockProjectRepository;
    private readonly Mock<IRepository<User>> _mockUserRepository;
    private readonly Mock<ILogger<CreateProjectCommandHandler>> _mockLogger;
    private readonly CreateProjectCommandHandler _handler;

    public CreateProjectCommandTests()
    {
        _mockUnitOfWork = new Mock<IUnitOfWork>();
        _mockProjectRepository = new Mock<IRepository<Project>>();
        _mockUserRepository = new Mock<IRepository<User>>();
        _mockLogger = new Mock<ILogger<CreateProjectCommandHandler>>();

        _mockUnitOfWork.Setup(x => x.Repository<Project>()).Returns(_mockProjectRepository.Object);
        _mockUnitOfWork.Setup(x => x.Repository<User>()).Returns(_mockUserRepository.Object);

        _handler = new CreateProjectCommandHandler(_mockUnitOfWork.Object, _mockLogger.Object);
    }

    [Fact]
    public async Task Handle_ValidProject_ShouldCreateProjectSuccessfully()
    {
        // Arrange
        var userId = Guid.NewGuid();
        var user = new User
        {
            Id = userId,
            Email = "test@company.com",
            FirstName = "Test",
            LastName = "User",
            Role = "Manager"
        };

        var createProjectDto = new CreateProjectDto(
            Name: "Test Project",
            Description: "Test Description",
            ImageUrl: null,
            StartDate: DateTime.UtcNow.AddDays(1),
            EndDate: DateTime.UtcNow.AddDays(30),
            Status: ProjectStatus.Planning,
            Budget: 10000m,
            ClientName: "Test Client",
            Tags: "test,project",
            Priority: 1,
            TeamMemberIds: [userId]
        );

        var command = new CreateProjectCommand(createProjectDto);

        _mockUserRepository.Setup(x => x.GetByIdAsync(userId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(user);

        _mockProjectRepository.Setup(x => x.AddAsync(It.IsAny<Project>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Project p, CancellationToken _) => 
            {
                p.Id = Guid.NewGuid();
                return p;
            });

        _mockUnitOfWork.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.Name.Should().Be(createProjectDto.Name);
        result.Description.Should().Be(createProjectDto.Description);
        result.Status.Should().Be(createProjectDto.Status);
        result.Budget.Should().Be(createProjectDto.Budget);
        result.ClientName.Should().Be(createProjectDto.ClientName);
        result.TeamMembers.Should().HaveCount(1);
        result.TeamMembers.First().Id.Should().Be(userId);

        _mockProjectRepository.Verify(x => x.AddAsync(It.IsAny<Project>(), It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_EmptyTeamMemberIds_ShouldCreateProjectWithNoTeamMembers()
    {
        // Arrange
        var createProjectDto = new CreateProjectDto(
            Name: "Test Project",
            Description: "Test Description",
            ImageUrl: null,
            StartDate: DateTime.UtcNow.AddDays(1),
            EndDate: DateTime.UtcNow.AddDays(30),
            Status: ProjectStatus.Planning,
            Budget: 10000m,
            ClientName: "Test Client",
            Tags: "test,project",
            Priority: 1,
            TeamMemberIds: []
        );

        var command = new CreateProjectCommand(createProjectDto);

        _mockProjectRepository.Setup(x => x.AddAsync(It.IsAny<Project>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Project p, CancellationToken _) => 
            {
                p.Id = Guid.NewGuid();
                return p;
            });

        _mockUnitOfWork.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TeamMembers.Should().BeEmpty();

        _mockProjectRepository.Verify(x => x.AddAsync(It.IsAny<Project>(), It.IsAny<CancellationToken>()), Times.Once);
        _mockUnitOfWork.Verify(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once);
    }

    [Fact]
    public async Task Handle_NonExistentTeamMember_ShouldSkipNonExistentMembers()
    {
        // Arrange
        var existingUserId = Guid.NewGuid();
        var nonExistentUserId = Guid.NewGuid();
        
        var existingUser = new User
        {
            Id = existingUserId,
            Email = "existing@company.com",
            FirstName = "Existing",
            LastName = "User",
            Role = "Employee"
        };

        var createProjectDto = new CreateProjectDto(
            Name: "Test Project",
            Description: "Test Description",
            ImageUrl: null,
            StartDate: DateTime.UtcNow.AddDays(1),
            EndDate: DateTime.UtcNow.AddDays(30),
            Status: ProjectStatus.Planning,
            Budget: 10000m,
            ClientName: "Test Client",
            Tags: "test,project",
            Priority: 1,
            TeamMemberIds: [existingUserId, nonExistentUserId]
        );

        var command = new CreateProjectCommand(createProjectDto);

        _mockUserRepository.Setup(x => x.GetByIdAsync(existingUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync(existingUser);

        _mockUserRepository.Setup(x => x.GetByIdAsync(nonExistentUserId, It.IsAny<CancellationToken>()))
            .ReturnsAsync((User?)null);

        _mockProjectRepository.Setup(x => x.AddAsync(It.IsAny<Project>(), It.IsAny<CancellationToken>()))
            .ReturnsAsync((Project p, CancellationToken _) => 
            {
                p.Id = Guid.NewGuid();
                return p;
            });

        _mockUnitOfWork.Setup(x => x.SaveChangesAsync(It.IsAny<CancellationToken>()))
            .ReturnsAsync(1);

        // Act
        var result = await _handler.Handle(command, CancellationToken.None);

        // Assert
        result.Should().NotBeNull();
        result.TeamMembers.Should().HaveCount(1);
        result.TeamMembers.First().Id.Should().Be(existingUserId);

        _mockUserRepository.Verify(x => x.GetByIdAsync(existingUserId, It.IsAny<CancellationToken>()), Times.Once);
        _mockUserRepository.Verify(x => x.GetByIdAsync(nonExistentUserId, It.IsAny<CancellationToken>()), Times.Once);
    }
}