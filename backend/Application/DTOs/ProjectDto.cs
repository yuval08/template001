using IntranetStarter.Domain.Entities;
using MediatR;

namespace IntranetStarter.Application.DTOs;

public record GetProjectQuery(Guid Id) : IRequest<ProjectDto?>;

public record GetProjectsQuery(int Page = 1, int PageSize = 10, string? Search = null) : IRequest<ProjectsResponse>;

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