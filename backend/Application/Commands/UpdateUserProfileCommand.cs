using IntranetStarter.Application.DTOs;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Commands;

public record UpdateUserProfileCommand(UpdateUserProfileDto UserProfile) : IRequest<UserDto>;

public class UpdateUserProfileCommandHandler : IRequestHandler<UpdateUserProfileCommand, UserDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<UpdateUserProfileCommandHandler> _logger;

    public UpdateUserProfileCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<UpdateUserProfileCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<UserDto> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Updating user profile for UserID: {UserId}", request.UserProfile.UserId);

        var userRepository = _unitOfWork.Repository<User>();
        
        // Get the user to update
        var user = await userRepository.GetByIdAsync(request.UserProfile.UserId, cancellationToken);
        if (user == null)
        {
            throw new ArgumentException($"User with ID '{request.UserProfile.UserId}' not found");
        }

        // Update profile fields (excluding role which should be updated via UpdateUserRoleCommand)
        user.FirstName = request.UserProfile.FirstName;
        user.LastName = request.UserProfile.LastName;
        user.Department = request.UserProfile.Department;
        user.JobTitle = request.UserProfile.JobTitle;
        user.IsActive = request.UserProfile.IsActive;

        var updatedUser = await userRepository.UpdateAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User profile updated successfully for UserID: {UserId}", updatedUser.Id);

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