using IntranetStarter.Application.Features.Invitations.DTOs;
using IntranetStarter.Application.Features.Users.Mappers;
using IntranetStarter.Domain.Constants;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Features.Invitations.Commands;

public record CreatePendingInvitationCommand(CreatePendingInvitationDto Invitation) : IRequest<PendingInvitationDto>;

public class CreatePendingInvitationCommandHandler(IUnitOfWork unitOfWork, ILogger<CreatePendingInvitationCommandHandler> logger)
    : IRequestHandler<CreatePendingInvitationCommand, PendingInvitationDto> {
    public async Task<PendingInvitationDto> Handle(CreatePendingInvitationCommand request, CancellationToken cancellationToken) {
        logger.LogInformation("Creating pending invitation for email: {Email}", request.Invitation.Email);

        // Validate role
        if (!UserRoles.IsValidRole(request.Invitation.IntendedRole)) {
            throw new ArgumentException($"Invalid role '{request.Invitation.IntendedRole}'. Valid roles are: {string.Join(", ", UserRoles.All)}");
        }

        var userRepository       = unitOfWork.Repository<User>();
        var invitationRepository = unitOfWork.Repository<PendingInvitation>();

        // Check if user already exists
        var existingUser = await userRepository.FindAsync(u => u.Email == request.Invitation.Email, cancellationToken);
        if (existingUser.Any()) {
            throw new InvalidOperationException($"A user with email '{request.Invitation.Email}' already exists");
        }

        // Check for existing active invitations
        var existingInvitations = await invitationRepository.FindAsync(
            i => i.Email == request.Invitation.Email && !i.IsUsed && i.ExpiresAt > DateTime.UtcNow,
            cancellationToken);

        if (existingInvitations.Any()) {
            throw new InvalidOperationException($"An active invitation for email '{request.Invitation.Email}' already exists");
        }

        // Verify the inviter exists
        var inviter = await userRepository.GetByIdAsync(request.Invitation.InvitedById, cancellationToken);
        if (inviter == null) {
            throw new ArgumentException($"Inviter with ID '{request.Invitation.InvitedById}' not found");
        }

        var invitation = new PendingInvitation {
            Email        = request.Invitation.Email,
            IntendedRole = request.Invitation.IntendedRole,
            InvitedById  = request.Invitation.InvitedById,
            InvitedAt    = DateTime.UtcNow,
            ExpiresAt    = DateTime.UtcNow.AddDays(request.Invitation.ExpirationDays),
            IsUsed       = false
        };

        var createdInvitation = await invitationRepository.AddAsync(invitation, cancellationToken);
        await unitOfWork.SaveChangesAsync(cancellationToken);

        logger.LogInformation("Pending invitation created successfully with ID: {InvitationId}", createdInvitation.Id);

        // Load the inviter for the DTO mapping
        createdInvitation.InvitedBy = inviter;

        return MapToDto(createdInvitation);
    }

    private static PendingInvitationDto MapToDto(PendingInvitation invitation) {
        return new PendingInvitationDto(
            invitation.Id,
            invitation.Email,
            invitation.IntendedRole,
            invitation.InvitedBy.MapToUserDto(),
            invitation.InvitedAt,
            invitation.ExpiresAt,
            invitation.IsUsed,
            invitation.UsedAt
        );
    }
}