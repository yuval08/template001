using IntranetStarter.Application.Features.Users.DTOs;

namespace IntranetStarter.Application.Features.Invitations.DTOs;

public record PendingInvitationsResponse(List<PendingInvitationDto> Data, int TotalCount, int PageNumber, int PageSize, int TotalPages);

public record PendingInvitationDto(
    Guid      Id,
    string    Email,
    string    IntendedRole,
    UserDto   InvitedBy,
    DateTime  InvitedAt,
    DateTime  ExpiresAt,
    bool      IsUsed,
    DateTime? UsedAt
);

public record CreatePendingInvitationDto(
    string Email,
    string IntendedRole,
    Guid   InvitedById,
    int    ExpirationDays = 30
);