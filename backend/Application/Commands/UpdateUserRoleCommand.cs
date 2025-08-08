using IntranetStarter.Application.DTOs;
using IntranetStarter.Application.Mappers;
using IntranetStarter.Domain.Constants;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Commands;

public record UpdateUserRoleCommand(UpdateUserRoleDto UserRole) : IRequest<UserDto>;

public class UpdateUserRoleCommandHandler(IUnitOfWork unitOfWork, ILogger<UpdateUserRoleCommandHandler> logger) : IRequestHandler<UpdateUserRoleCommand, UserDto> {
    public async Task<UserDto> Handle(UpdateUserRoleCommand request, CancellationToken cancellationToken) {
        logger.LogInformation("Updating user role for UserID: {UserId} to {NewRole} by UpdaterID: {UpdatedById}",
            request.UserRole.UserId, request.UserRole.NewRole, request.UserRole.UpdatedById);

        // Validate role
        if (!UserRoles.IsValidRole(request.UserRole.NewRole)) {
            throw new ArgumentException($"Invalid role '{request.UserRole.NewRole}'. Valid roles are: {string.Join(", ", UserRoles.All)}");
        }

        var userRepository = unitOfWork.Repository<User>();

        // Get the user to update
        var user = await userRepository.GetByIdAsync(request.UserRole.UserId, cancellationToken);
        if (user == null) {
            throw new ArgumentException($"User with ID '{request.UserRole.UserId}' not found");
        }

        // Get the user performing the update
        var updater = await userRepository.GetByIdAsync(request.UserRole.UpdatedById, cancellationToken);
        if (updater == null) {
            throw new ArgumentException($"Updater with ID '{request.UserRole.UpdatedById}' not found");
        }

        // Prevent users from changing their own admin role
        if (request.UserRole.UserId == request.UserRole.UpdatedById && user.Role == "Admin") {
            throw new InvalidOperationException("Users cannot modify their own admin role");
        }

        // Update the role
        string oldRole = user.Role;
        user.Role = request.UserRole.NewRole;

        var updatedUser = await userRepository.UpdateAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation("User role updated successfully. UserID: {UserId}, OldRole: {OldRole}, NewRole: {NewRole}",
            updatedUser.Id, oldRole, updatedUser.Role);

        return updatedUser.MapToUserDto();
    }
}