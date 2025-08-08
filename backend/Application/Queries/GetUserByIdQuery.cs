using IntranetStarter.Application.DTOs;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Queries;

public record GetUserByIdQuery(Guid UserId) : IRequest<DetailedUserDto?>;

public class GetUserByIdQueryHandler : IRequestHandler<GetUserByIdQuery, DetailedUserDto?>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<GetUserByIdQueryHandler> _logger;

    public GetUserByIdQueryHandler(
        IUnitOfWork unitOfWork,
        ILogger<GetUserByIdQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<DetailedUserDto?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching user with ID: {UserId}", request.UserId);

        var user = await _unitOfWork.Repository<User>().GetByIdAsync(request.UserId, cancellationToken);
        
        if (user == null)
        {
            _logger.LogWarning("User with ID {UserId} not found", request.UserId);
            return null;
        }

        // Get user's projects count
        var projectsRepository = _unitOfWork.Repository<Project>();
        var userProjects = await projectsRepository.FindAsync(p => 
            p.OwnerId == user.Id || p.TeamMembers.Any(tm => tm.Id == user.Id), 
            cancellationToken);
        var projectsCount = userProjects.Count();

        // Get invited by user details if applicable
        UserDto? invitedByUser = null;
        if (user.InvitedById.HasValue)
        {
            var invitedBy = await _unitOfWork.Repository<User>().GetByIdAsync(user.InvitedById.Value, cancellationToken);
            if (invitedBy != null)
            {
                invitedByUser = MapToUserDto(invitedBy);
            }
        }

        return MapToDetailedDto(user, projectsCount, invitedByUser);
    }

    private static DetailedUserDto MapToDetailedDto(User user, int projectsCount, UserDto? invitedBy)
    {
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