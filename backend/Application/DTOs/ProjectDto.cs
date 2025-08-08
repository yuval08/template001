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

public record DetailedUserDto(
    Guid Id,
    string Email,
    string FirstName,
    string LastName,
    string? Avatar,
    string Role,
    string? Department,
    string? JobTitle,
    bool IsActive,
    DateTime? LastLoginAt,
    bool IsProvisioned,
    DateTime? InvitedAt,
    DateTime? ActivatedAt,
    DateTime CreatedAt,
    DateTime? UpdatedAt,
    UserDto? InvitedBy,
    int ProjectsCount
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

// User Management DTOs
public record CreateUserDto(
    string Email,
    string FirstName,
    string LastName,
    string Role,
    string? Department,
    string? JobTitle
);

public record UpdateUserRoleDto(
    Guid UserId,
    string NewRole,
    Guid UpdatedById
);

public record UpdateUserProfileDto(
    Guid UserId,
    string FirstName,
    string LastName,
    string? Department,
    string? JobTitle,
    bool IsActive
);

public record CreatePendingInvitationDto(
    string Email,
    string IntendedRole,
    Guid InvitedById,
    int ExpirationDays = 30
);

public record PendingInvitationDto(
    Guid Id,
    string Email,
    string IntendedRole,
    UserDto InvitedBy,
    DateTime InvitedAt,
    DateTime ExpiresAt,
    bool IsUsed,
    DateTime? UsedAt
);