using IntranetStarter.Application.DTOs;
using IntranetStarter.Application.Mappers;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Queries;

public record GetPendingInvitationsQuery(
    int  PageNumber     = 1,
    int  PageSize       = 10,
    bool IncludeExpired = false
) : IRequest<PendingInvitationsResponse>;

public class GetPendingInvitationsQueryHandler(IUnitOfWork unitOfWork, ILogger<GetPendingInvitationsQueryHandler> logger) : IRequestHandler<GetPendingInvitationsQuery, PendingInvitationsResponse> {
    public async Task<PendingInvitationsResponse> Handle(GetPendingInvitationsQuery request, CancellationToken cancellationToken) {
        logger.LogInformation("Fetching pending invitations - Page: {PageNumber}, PageSize: {PageSize}, IncludeExpired: {IncludeExpired}",
            request.PageNumber, request.PageSize, request.IncludeExpired);

        var repository     = unitOfWork.Repository<PendingInvitation>();
        var userRepository = unitOfWork.Repository<User>();

        // Get all pending invitations (in a real implementation, you'd want to implement pagination at the repository level)
        var allInvitations = await repository.GetAllAsync(cancellationToken);

        // Filter only unused invitations
        allInvitations = allInvitations.Where(i => !i.IsUsed);

        // Filter expired invitations if not including them
        if (!request.IncludeExpired) {
            var now = DateTime.UtcNow;
            allInvitations = allInvitations.Where(i => i.ExpiresAt > now);
        }

        int totalCount = allInvitations.Count();
        int totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        // Apply pagination and sort by invitation date (newest first)
        var invitations = allInvitations
            .OrderByDescending(i => i.InvitedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        // Map to DTOs with inviter details
        var invitationDtos = new List<PendingInvitationDto>();
        foreach (var invitation in invitations) {
            var invitedBy = await userRepository.GetByIdAsync(invitation.InvitedById, cancellationToken);
            if (invitedBy == null)
                continue;
            var invitedByDto = invitedBy.MapToUserDto();
            invitationDtos.Add(invitation.MapToDto(invitedByDto));
        }

        logger.LogInformation("Retrieved {Count} pending invitations out of {TotalCount}", invitationDtos.Count, totalCount);

        return new PendingInvitationsResponse(invitationDtos, totalCount, request.PageNumber, request.PageSize, totalPages);
    }
}