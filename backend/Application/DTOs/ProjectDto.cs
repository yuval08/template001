using IntranetStarter.Domain.Entities;

namespace IntranetStarter.Application.DTOs;

public record ProjectDto(
    Guid Id,
    string Name,
    string Description,
    string? ImageUrl,
    DateTime? StartDate,
    DateTime? EndDate,
    ProjectStatus Status,
    decimal Budget,
    string? ClientName,
    string? Tags,
    int Priority,
    UserDto? Owner,
    List<UserDto> TeamMembers,
    DateTime CreatedAt,
    DateTime? UpdatedAt
);

public record UserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? Avatar,
    string Role,
    string? Department,
    string? JobTitle,
    bool IsActive
);

public record CreateProjectDto(
    string Name,
    string Description,
    string? ImageUrl,
    DateTime? StartDate,
    DateTime? EndDate,
    ProjectStatus Status,
    decimal Budget,
    string? ClientName,
    string? Tags,
    int Priority,
    List<Guid> TeamMemberIds
);

public record UpdateProjectDto(
    string Name,
    string Description,
    string? ImageUrl,
    DateTime? StartDate,
    DateTime? EndDate,
    ProjectStatus Status,
    decimal Budget,
    string? ClientName,
    string? Tags,
    int Priority,
    List<Guid> TeamMemberIds
);