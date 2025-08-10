using MediatR;

namespace IntranetStarter.Application.DTOs;

public record GetPendingInvitationsQuery(int PageNumber = 1, int PageSize = 10, bool IncludeExpired = false) : IRequest<PendingInvitationsResponse>;

public record PendingInvitationsResponse(List<PendingInvitationDto> Data, int TotalCount, int PageNumber, int PageSize, int TotalPages);