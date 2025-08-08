using IntranetStarter.Application.DTOs;
using IntranetStarter.Domain.Entities;

namespace IntranetStarter.Application.Mappers;

public static class PendingInvitationMapper {
    public static PendingInvitationDto MapToDto(this PendingInvitation invitation, UserDto invitedBy) {
        return new PendingInvitationDto(
            invitation.Id,
            invitation.Email,
            invitation.IntendedRole,
            invitedBy,
            invitation.InvitedAt,
            invitation.ExpiresAt,
            invitation.IsUsed,
            invitation.UsedAt
        );
    }
}