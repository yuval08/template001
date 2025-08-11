using IntranetStarter.Application.Features.Projects.DTOs;
using IntranetStarter.Application.Features.Users.Mappers;
using IntranetStarter.Domain.Entities;

namespace IntranetStarter.Application.Features.Projects.Mappers;

public static class ProjectMapper {
    public static ProjectDto MapToDto(this Project project) {
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