using MediatR;

namespace IntranetStarter.Application.Features.Users.DTOs;

public record UserDto(
    Guid     Id,
    string   Email,
    string   FirstName,
    string   LastName,
    string?  Avatar,
    string   Role,
    string?  Department,
    string?  JobTitle,
    bool     IsActive,
    DateTime CreatedAt
);

public record UsersResponse(
    List<UserDto> Data,
    int           TotalCount,
    int           PageNumber,
    int           PageSize,
    int           TotalPages
);

public record DetailedUserDto(
    Guid      Id,
    string    Email,
    string    FirstName,
    string    LastName,
    string?   Avatar,
    string    Role,
    string?   Department,
    string?   JobTitle,
    bool      IsActive,
    DateTime? LastLoginAt,
    bool      IsProvisioned,
    DateTime? InvitedAt,
    DateTime? ActivatedAt,
    DateTime  CreatedAt,
    DateTime? UpdatedAt,
    UserDto?  InvitedBy,
    int       ProjectsCount
);

// User Management DTOs
public record CreateUserDto(
    string  Email,
    string  FirstName,
    string  LastName,
    string  Role,
    string? Department,
    string? JobTitle
);

public record UpdateUserRoleDto(
    Guid   UserId,
    string NewRole,
    Guid   UpdatedById
);

public record UpdateUserProfileDto(
    Guid    UserId,
    string  FirstName,
    string  LastName,
    string? Department,
    string? JobTitle,
    bool    IsActive
);
