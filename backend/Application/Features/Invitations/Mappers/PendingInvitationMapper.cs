using IntranetStarter.Application.Features.Invitations.DTOs;
using IntranetStarter.Application.Features.Users.DTOs;
using IntranetStarter.Application.Features.Users.Mappers;
using IntranetStarter.Domain.Entities;

namespace IntranetStarter.Application.Features.Invitations.Mappers;

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
    public static PendingInvitationDto MapToDto(this PendingInvitation invitation) {
        return new PendingInvitationDto(
            invitation.Id,
            invitation.Email,
            invitation.IntendedRole,
            invitation.InvitedBy.MapToUserDto(),
            invitation.InvitedAt,
            invitation.ExpiresAt,
            invitation.IsUsed,
            invitation.UsedAt
        );
    }
}