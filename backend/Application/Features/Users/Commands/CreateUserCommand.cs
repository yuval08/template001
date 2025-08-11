using IntranetStarter.Application.Features.Users.DTOs;
using IntranetStarter.Application.Features.Users.Mappers;
using IntranetStarter.Domain.Constants;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Features.Users.Commands;

public record CreateUserCommand(CreateUserDto User) : IRequest<UserDto>;

public class CreateUserCommandHandler(IUnitOfWork unitOfWork, IConfiguration configuration, ILogger<CreateUserCommandHandler> logger) : IRequestHandler<CreateUserCommand, UserDto> {
    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken) {
        logger.LogInformation("Creating new user: {Email}", request.User.Email);

        // Validate domain restriction
        string? allowedDomain = configuration["ALLOWED_DOMAIN"];
        if (!string.IsNullOrEmpty(allowedDomain)) {
            if (!request.User.Email.EndsWith($"@{allowedDomain}", StringComparison.OrdinalIgnoreCase)) {
                logger.LogWarning("Attempted to create user with email {Email} outside of allowed domain @{Domain}", 
                    request.User.Email, allowedDomain);
                throw new ArgumentException($"User email must be from the @{allowedDomain} domain");
            }
        }

        // Validate role
        if (!UserRoles.IsValidRole(request.User.Role)) {
            throw new ArgumentException($"Invalid role '{request.User.Role}'. Valid roles are: {string.Join(", ", UserRoles.All)}");
        }

        var userRepository = unitOfWork.Repository<User>();

        // Check for duplicate email
        var existingUser = await userRepository.FindAsync(u => u.Email == request.User.Email, cancellationToken);
        if (existingUser.Any()) {
            throw new InvalidOperationException($"A user with email '{request.User.Email}' already exists");
        }

        var user = new User {
            Email         = request.User.Email,
            FirstName     = request.User.FirstName,
            LastName      = request.User.LastName,
            Role          = request.User.Role,
            Department    = request.User.Department,
            JobTitle      = request.User.JobTitle,
            IsProvisioned = true,
            IsActive      = true
        };

        var createdUser = await userRepository.AddAsync(user, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation("User created successfully with ID: {UserId}", createdUser.Id);

        return createdUser.MapToUserDto();
    }
}