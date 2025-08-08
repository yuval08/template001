using IntranetStarter.Application.DTOs;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Queries;

public record GetPendingInvitationsQuery(
    int PageNumber = 1, 
    int PageSize = 10, 
    bool IncludeExpired = false
) : IRequest<PendingInvitationsResponse>;

public record PendingInvitationsResponse(
    List<PendingInvitationDto> Data,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages
);

public class GetPendingInvitationsQueryHandler : IRequestHandler<GetPendingInvitationsQuery, PendingInvitationsResponse>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<GetPendingInvitationsQueryHandler> _logger;

    public GetPendingInvitationsQueryHandler(
        IUnitOfWork unitOfWork,
        ILogger<GetPendingInvitationsQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PendingInvitationsResponse> Handle(GetPendingInvitationsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching pending invitations - Page: {PageNumber}, PageSize: {PageSize}, IncludeExpired: {IncludeExpired}", 
            request.PageNumber, request.PageSize, request.IncludeExpired);

        var repository = _unitOfWork.Repository<PendingInvitation>();
        var userRepository = _unitOfWork.Repository<User>();
        
        // Get all pending invitations (in a real implementation, you'd want to implement pagination at the repository level)
        var allInvitations = await repository.GetAllAsync(cancellationToken);
        
        // Filter only unused invitations
        allInvitations = allInvitations.Where(i => !i.IsUsed);

        // Filter expired invitations if not including them
        if (!request.IncludeExpired)
        {
            var now = DateTime.UtcNow;
            allInvitations = allInvitations.Where(i => i.ExpiresAt > now);
        }

        var totalCount = allInvitations.Count();
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        // Apply pagination and sort by invitation date (newest first)
        var invitations = allInvitations
            .OrderByDescending(i => i.InvitedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        // Map to DTOs with inviter details
        var invitationDtos = new List<PendingInvitationDto>();
        foreach (var invitation in invitations)
        {
            var invitedBy = await userRepository.GetByIdAsync(invitation.InvitedById, cancellationToken);
            if (invitedBy != null)
            {
                var invitedByDto = MapToUserDto(invitedBy);
                invitationDtos.Add(MapToDto(invitation, invitedByDto));
            }
        }

        _logger.LogInformation("Retrieved {Count} pending invitations out of {TotalCount}", invitationDtos.Count, totalCount);

        return new PendingInvitationsResponse(invitationDtos, totalCount, request.PageNumber, request.PageSize, totalPages);
    }

    private static PendingInvitationDto MapToDto(PendingInvitation invitation, UserDto invitedBy)
    {
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

    private static UserDto MapToUserDto(User user)
    {
        return new UserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Avatar,
            user.Role,
            user.Department,
            user.JobTitle,
            user.IsActive
        );
    }
}