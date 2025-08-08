namespace IntranetStarter.Application.DTOs;

public record PendingInvitationsResponse(
    List<PendingInvitationDto> Data,
    int                        TotalCount,
    int                        PageNumber,
    int                        PageSize,
    int                        TotalPages
);