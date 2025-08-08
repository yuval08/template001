using IntranetStarter.Application.DTOs;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Commands;

public record CreatePendingInvitationCommand(CreatePendingInvitationDto Invitation) : IRequest<PendingInvitationDto>;

public class CreatePendingInvitationCommandHandler : IRequestHandler<CreatePendingInvitationCommand, PendingInvitationDto>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<CreatePendingInvitationCommandHandler> _logger;
    
    private static readonly string[] ValidRoles = { "Admin", "Manager", "Employee" };

    public CreatePendingInvitationCommandHandler(
        IUnitOfWork unitOfWork,
        ILogger<CreatePendingInvitationCommandHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<PendingInvitationDto> Handle(CreatePendingInvitationCommand request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Creating pending invitation for email: {Email}", request.Invitation.Email);

        // Validate role
        if (!ValidRoles.Contains(request.Invitation.IntendedRole))
        {
            throw new ArgumentException($"Invalid role '{request.Invitation.IntendedRole}'. Valid roles are: {string.Join(", ", ValidRoles)}");
        }

        var userRepository = _unitOfWork.Repository<User>();
        var invitationRepository = _unitOfWork.Repository<PendingInvitation>();
        
        // Check if user already exists
        var existingUser = await userRepository.FindAsync(u => u.Email == request.Invitation.Email, cancellationToken);
        if (existingUser.Any())
        {
            throw new InvalidOperationException($"A user with email '{request.Invitation.Email}' already exists");
        }

        // Check for existing active invitations
        var existingInvitations = await invitationRepository.FindAsync(
            i => i.Email == request.Invitation.Email && !i.IsUsed && i.ExpiresAt > DateTime.UtcNow, 
            cancellationToken);
        
        if (existingInvitations.Any())
        {
            throw new InvalidOperationException($"An active invitation for email '{request.Invitation.Email}' already exists");
        }

        // Verify the inviter exists
        var inviter = await userRepository.GetByIdAsync(request.Invitation.InvitedById, cancellationToken);
        if (inviter == null)
        {
            throw new ArgumentException($"Inviter with ID '{request.Invitation.InvitedById}' not found");
        }

        var invitation = new PendingInvitation
        {
            Email = request.Invitation.Email,
            IntendedRole = request.Invitation.IntendedRole,
            InvitedById = request.Invitation.InvitedById,
            InvitedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(request.Invitation.ExpirationDays),
            IsUsed = false
        };

        var createdInvitation = await invitationRepository.AddAsync(invitation, cancellationToken);
        await _unitOfWork.SaveChangesAsync(cancellationToken);

        _logger.LogInformation("Pending invitation created successfully with ID: {InvitationId}", createdInvitation.Id);

        // Load the inviter for the DTO mapping
        createdInvitation.InvitedBy = inviter;

        return MapToDto(createdInvitation);
    }

    private static PendingInvitationDto MapToDto(PendingInvitation invitation)
    {
        return new PendingInvitationDto(
            invitation.Id,
            invitation.Email,
            invitation.IntendedRole,
            new UserDto(
                invitation.InvitedBy.Id,
                invitation.InvitedBy.Email,
                invitation.InvitedBy.FirstName,
                invitation.InvitedBy.LastName,
                invitation.InvitedBy.Avatar,
                invitation.InvitedBy.Role,
                invitation.InvitedBy.Department,
                invitation.InvitedBy.JobTitle,
                invitation.InvitedBy.IsActive
            ),
            invitation.InvitedAt,
            invitation.ExpiresAt,
            invitation.IsUsed,
            invitation.UsedAt
        );
    }
}