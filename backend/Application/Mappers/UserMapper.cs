using IntranetStarter.Application.DTOs;
using IntranetStarter.Domain.Entities;

namespace IntranetStarter.Application.Mappers;

public static class UserMapper {
    public static UserDto MapToUserDto(this User user) {
        return new UserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Avatar,
            user.Role,
            user.Department,
            user.JobTitle,
            user.IsActive,
            user.CreatedAt
        );
    }
    public static DetailedUserDto MapToDetailedDto(this User user, int projectsCount, UserDto? invitedBy) {
        return new DetailedUserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Avatar,
            user.Role,
            user.Department,
            user.JobTitle,
            user.IsActive,
            user.LastLoginAt,
            user.IsProvisioned,
            user.InvitedAt,
            user.ActivatedAt,
            user.CreatedAt,
            user.UpdatedAt,
            invitedBy,
            projectsCount
        );
    }
}