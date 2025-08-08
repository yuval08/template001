using IntranetStarter.Application.DTOs;
using IntranetStarter.Application.Mappers;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Commands;

public record UpdateUserProfileCommand(UpdateUserProfileDto UserProfile) : IRequest<UserDto>;

public class UpdateUserProfileCommandHandler(IUnitOfWork unitOfWork, ILogger<UpdateUserProfileCommandHandler> logger) : IRequestHandler<UpdateUserProfileCommand, UserDto> {
    public async Task<UserDto> Handle(UpdateUserProfileCommand request, CancellationToken cancellationToken) {
        logger.LogInformation("Updating user profile for UserID: {UserId}", request.UserProfile.UserId);

        var userRepository = unitOfWork.Repository<User>();

        // Get the user to update
        var user = await userRepository.GetByIdAsync(request.UserProfile.UserId, cancellationToken);
        if (user == null) {
            throw new ArgumentException($"User with ID '{request.UserProfile.UserId}' not found");
        }

        // Update profile fields (excluding role which should be updated via UpdateUserRoleCommand)
        user.FirstName  = request.UserProfile.FirstName;
        user.LastName   = request.UserProfile.LastName;
        user.Department = request.UserProfile.Department;
        user.JobTitle   = request.UserProfile.JobTitle;
        user.IsActive   = request.UserProfile.IsActive;

        var updatedUser = await userRepository.UpdateAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation("User profile updated successfully for UserID: {UserId}", updatedUser.Id);

        return updatedUser.MapToUserDto();
    }
}