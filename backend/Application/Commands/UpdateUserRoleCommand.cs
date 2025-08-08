using IntranetStarter.Application.DTOs;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Commands;

public record UpdateUserRoleCommand(UpdateUserRoleDto UserRole) : IRequest<UserDto>;

public class UpdateUserRoleCommandHandler : IRequestHandler<UpdateUserRoleCommand, UserDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateUserRoleCommandHandler> _logger;
    
    private static readonly string[] ValidRoles = { "Admin", "Manager", "Employee" };

    public UpdateUserRoleCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<UpdateUserRoleCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<UserDto> Handle(UpdateUserRoleCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating user role for UserID: {UserId} to {NewRole} by UpdaterID: {UpdatedById}", 
            request.UserRole.UserId, request.UserRole.NewRole, request.UserRole.UpdatedById);

        // Validate role
        if (!ValidRoles.Contains(request.UserRole.NewRole))
        {
            throw new ArgumentException($"Invalid role '{request.UserRole.NewRole}'. Valid roles are: {string.Join(", ", ValidRoles)}");
        }

        var userRepository = _unitOfWork.Repository<User>();
        
        // Get the user to update
        var user = await userRepository.GetByIdAsync(request.UserRole.UserId, cancellationToken);
        if (user == null)
        {
            throw new ArgumentException($"User with ID '{request.UserRole.UserId}' not found");
        }

        // Get the user performing the update
        var updater = await userRepository.GetByIdAsync(request.UserRole.UpdatedById, cancellationToken);
        if (updater == null)
        {
            throw new ArgumentException($"Updater with ID '{request.UserRole.UpdatedById}' not found");
        }

        // Prevent users from changing their own admin role
        if (request.UserRole.UserId == request.UserRole.UpdatedById && user.Role == "Admin")
        {
            throw new InvalidOperationException("Users cannot modify their own admin role");
        }

        // Update the role
        var oldRole = user.Role;
        user.Role = request.UserRole.NewRole;

        var updatedUser = await userRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User role updated successfully. UserID: {UserId}, OldRole: {OldRole}, NewRole: {NewRole}", 
            updatedUser.Id, oldRole, updatedUser.Role);

        return MapToDto(updatedUser);
    }

    private static UserDto MapToDto(User user)
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