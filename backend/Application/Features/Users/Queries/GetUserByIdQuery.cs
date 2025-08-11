using IntranetStarter.Application.Features.Users.DTOs;
using IntranetStarter.Application.Features.Users.Mappers;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Features.Users.Queries;

public record GetUserByIdQuery(Guid UserId) : IRequest<DetailedUserDto?>;

public class GetUserByIdQueryHandler(IUnitOfWork unitOfWork, ILogger<GetUserByIdQueryHandler> logger) : IRequestHandler<GetUserByIdQuery, DetailedUserDto?> {
    public async Task<DetailedUserDto?> Handle(GetUserByIdQuery request, CancellationToken cancellationToken) {
        logger.LogInformation("Fetching user with ID: {UserId}", request.UserId);

        var user = await unitOfWork.Repository<User>().GetByIdAsync(request.UserId, cancellationToken);

        if (user == null) {
            logger.LogWarning("User with ID {UserId} not found", request.UserId);
            return null;
        }

        // Get user's projects count
        var projectsRepository = unitOfWork.Repository<Project>();
        var userProjects = await projectsRepository.FindAsync(p =>
                p.OwnerId == user.Id || p.TeamMembers.Any(tm => tm.Id == user.Id),
            cancellationToken);
        int projectsCount = userProjects.Count();

        // Get invited by user details if applicable
        UserDto? invitedByUser = null;
        if (user.InvitedById.HasValue) {
            var invitedBy = await unitOfWork.Repository<User>().GetByIdAsync(user.InvitedById.Value, cancellationToken);
            if (invitedBy != null) {
                invitedByUser = invitedBy.MapToUserDto();
            }
        }

        return user.MapToDetailedDto(projectsCount, invitedByUser);
    }
}