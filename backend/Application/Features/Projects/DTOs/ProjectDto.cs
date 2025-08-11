using IntranetStarter.Application.Features.Users.DTOs;
using IntranetStarter.Domain.Entities;

namespace IntranetStarter.Application.Features.Projects.DTOs;

public record ProjectsResponse(
    List<ProjectDto> Data,
    int              TotalCount,
    int              PageNumber,
    int              PageSize,
    int              TotalPages
);

public record ProjectDto(
    Guid          Id,
    string        Name,
    string        Description,
    string?       ImageUrl,
    DateTime?     StartDate,
    DateTime?     EndDate,
    ProjectStatus Status,
    decimal       Budget,
    string?       ClientName,
    string?       Tags,
    int           Priority,
    UserDto?      Owner,
    List<UserDto> TeamMembers,
    DateTime      CreatedAt,
    DateTime?     UpdatedAt
);

public record CreateProjectDto(
    string        Name,
    string        Description,
    string?       ImageUrl,
    DateTime?     StartDate,
    DateTime?     EndDate,
    ProjectStatus Status,
    decimal       Budget,
    string?       ClientName,
    string?       Tags,
    int           Priority,
    List<Guid>    TeamMemberIds
);

public record UpdateProjectDto(
    string        Name,
    string        Description,
    string?       ImageUrl,
    DateTime?     StartDate,
    DateTime?     EndDate,
    ProjectStatus Status,
    decimal       Budget,
    string?       ClientName,
    string?       Tags,
    int           Priority,
    List<Guid>    TeamMemberIds
);