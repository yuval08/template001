using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Features.Users.Commands;

public record DeleteUserCommand(Guid UserId, string DeletedBy, string? CurrentUserEmail = null) : IRequest<bool>;

public class DeleteUserCommandHandler(IUnitOfWork unitOfWork, ILogger<DeleteUserCommandHandler> logger) : IRequestHandler<DeleteUserCommand, bool> {
    public async Task<bool> Handle(DeleteUserCommand request, CancellationToken cancellationToken) {
        logger.LogInformation("Soft deleting user with UserID: {UserId} by {DeletedBy}", request.UserId, request.DeletedBy);

        var userRepository = unitOfWork.Repository<User>();

        // Get the user to delete
        var user = await userRepository.GetByIdAsync(request.UserId, cancellationToken);
        if (user == null) {
            throw new ArgumentException($"User with ID '{request.UserId}' not found");
        }

        // Prevent self-deletion if current user email is provided
        if (!string.IsNullOrEmpty(request.CurrentUserEmail) && user.Email.Equals(request.CurrentUserEmail, StringComparison.OrdinalIgnoreCase)) {
            logger.LogWarning("User {Email} attempted to delete their own account", request.CurrentUserEmail);
            throw new InvalidOperationException("You cannot delete your own account");
        }

        // Check if user is already inactive
        if (!user.IsActive) {
            logger.LogWarning("User with ID {UserId} is already inactive", request.UserId);
            throw new InvalidOperationException("User is already inactive");
        }

        // Soft delete by setting IsActive to false
        user.IsActive = false;
        user.UpdatedBy = request.DeletedBy;
        user.UpdatedAt = DateTime.UtcNow;

        await userRepository.UpdateAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation("User soft deleted successfully for UserID: {UserId} by {DeletedBy}", request.UserId, request.DeletedBy);

        return true;
    }
}