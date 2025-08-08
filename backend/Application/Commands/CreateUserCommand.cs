using IntranetStarter.Application.DTOs;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Commands;

public record CreateUserCommand(CreateUserDto User) : IRequest<UserDto>;

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, UserDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreateUserCommandHandler> _logger;
    
    private static readonly string[] ValidRoles = { "Admin", "Manager", "Employee" };

    public CreateUserCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<CreateUserCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<UserDto> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating new user: {Email}", request.User.Email);

        // Validate role
        if (!ValidRoles.Contains(request.User.Role))
        {
            throw new ArgumentException($"Invalid role '{request.User.Role}'. Valid roles are: {string.Join(", ", ValidRoles)}");
        }

        var userRepository = _unitOfWork.Repository<User>();
        
        // Check for duplicate email
        var existingUser = await userRepository.FindAsync(u => u.Email == request.User.Email, cancellationToken);
        if (existingUser.Any())
        {
            throw new InvalidOperationException($"A user with email '{request.User.Email}' already exists");
        }

        var user = new User
        {
            Email = request.User.Email,
            FirstName = request.User.FirstName,
            LastName = request.User.LastName,
            Role = request.User.Role,
            Department = request.User.Department,
            JobTitle = request.User.JobTitle,
            IsProvisioned = true,
            IsActive = true
        };

        var createdUser = await userRepository.AddAsync(user, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("User created successfully with ID: {UserId}", createdUser.Id);

        return MapToDto(createdUser);
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