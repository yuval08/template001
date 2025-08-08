using IntranetStarter.Application.DTOs;
using IntranetStarter.Application.Mappers;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Commands;

public record CreateProjectCommand(CreateProjectDto Project) : IRequest<ProjectDto>;

public class CreateProjectCommandHandler(IUnitOfWork unitOfWork, ILogger<CreateProjectCommandHandler> logger) : IRequestHandler<CreateProjectCommand, ProjectDto> {
    public async Task<ProjectDto> Handle(CreateProjectCommand request, CancellationToken cancellationToken) {
        logger.LogInformation("Creating new project: {ProjectName}", request.Project.Name);

        var project = new Project {
            Name        = request.Project.Name,
            Description = request.Project.Description,
            ImageUrl    = request.Project.ImageUrl,
            StartDate   = request.Project.StartDate,
            EndDate     = request.Project.EndDate,
            Status      = request.Project.Status,
            Budget      = request.Project.Budget,
            ClientName  = request.Project.ClientName,
            Tags        = request.Project.Tags,
            Priority    = request.Project.Priority
        };

        // Load team members
        var userRepository = unitOfWork.Repository<User>();
        var teamMembers    = new List<User>();

        foreach (var memberId in request.Project.TeamMemberIds) {
            var user = await userRepository.GetByIdAsync(memberId, cancellationToken);
            if (user != null) {
                teamMembers.Add(user);
            }
        }

        project.TeamMembers = teamMembers;

        var createdProject = await unitOfWork.Repository<Project>().AddAsync(project, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Project created successfully with ID: {ProjectId}", createdProject.Id);

        return MapToDto(createdProject);
    }

    private static ProjectDto MapToDto(Project project) {
        return new ProjectDto(
            project.Id,
            project.Name,
            project.Description,
            project.ImageUrl,
            project.StartDate,
            project.EndDate,
            project.Status,
            project.Budget,
            project.ClientName,
            project.Tags,
            project.Priority,
            project.Owner?.MapToUserDto(),
            project.TeamMembers.Select(u => u.MapToUserDto()).ToList(),
            project.CreatedAt,
            project.UpdatedAt
        );
    }
}