using IntranetStarter.Application.Features.Invitations.DTOs;
using IntranetStarter.Application.Features.Users.Mappers;
using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Constants;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Features.Invitations.Commands;

public record CreatePendingInvitationCommand(CreatePendingInvitationDto Invitation) : IRequest<PendingInvitationDto>;

public class CreatePendingInvitationCommandHandler(
    IUnitOfWork unitOfWork, 
    IEmailService emailService,
    IConfiguration configuration,
    ILogger<CreatePendingInvitationCommandHandler> logger)
    : IRequestHandler<CreatePendingInvitationCommand, PendingInvitationDto> {
    public async Task<PendingInvitationDto> Handle(CreatePendingInvitationCommand request, CancellationToken cancellationToken) {
        logger.LogInformation("Creating pending invitation for email: {Email}", request.Invitation.Email);

        // Validate domain restriction
        string? allowedDomain = configuration["ALLOWED_DOMAIN"];
        if (!string.IsNullOrEmpty(allowedDomain)) {
            if (!request.Invitation.Email.EndsWith($"@{allowedDomain}", StringComparison.OrdinalIgnoreCase)) {
                logger.LogWarning("Attempted to create invitation for email {Email} outside of allowed domain @{Domain}", 
                    request.Invitation.Email, allowedDomain);
                throw new ArgumentException($"Invitation email must be from the @{allowedDomain} domain");
            }
        }

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

        // Send invitation email
        try {
            await SendInvitationEmailAsync(createdInvitation, inviter, cancellationToken);
            logger.LogInformation("Invitation email sent successfully to {Email}", createdInvitation.Email);
        }
        catch (Exception ex) {
            // Log the error but don't fail the invitation creation
            logger.LogError(ex, "Failed to send invitation email to {Email}. The invitation was created but email was not sent.", createdInvitation.Email);
        }

        // Load the inviter for the DTO mapping
        createdInvitation.InvitedBy = inviter;

        return MapToDto(createdInvitation);
    }

    private async Task SendInvitationEmailAsync(PendingInvitation invitation, User inviter, CancellationToken cancellationToken) {
        var applicationName = configuration["ApplicationName"] ?? "Intranet Starter";
        var applicationUrl = configuration["ApplicationUrl"] ?? "http://localhost:3000";
        
        // Create the invitation link (this could include a token or invitation ID for validation)
        var invitationLink = $"{applicationUrl}/login?accept-invitation=true&id={invitation.Id}";
        
        var subject = $"You've been invited to join {applicationName}";
        
        // Load the HTML template
        var templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Infrastructure", "EmailTemplates", "InvitationEmail.html");
        if (!File.Exists(templatePath)) {
            // Fallback to embedded template
            templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Infrastructure", "EmailTemplates", "InvitationEmail.html");
        }
        
        string body;
        if (File.Exists(templatePath)) {
            body = await File.ReadAllTextAsync(templatePath, cancellationToken);
            
            // Replace placeholders
            body = body.Replace("{{ApplicationName}}", applicationName)
                      .Replace("{{InviterName}}", inviter.FullName)
                      .Replace("{{Role}}", invitation.IntendedRole)
                      .Replace("{{InvitationLink}}", invitationLink)
                      .Replace("{{ExpirationDate}}", invitation.ExpiresAt.ToString("MMMM dd, yyyy 'at' hh:mm tt 'UTC'"))
                      .Replace("{{Year}}", DateTime.UtcNow.Year.ToString())
                      .Replace("{{ApplicationUrl}}", applicationUrl);
        }
        else {
            // Fallback to simple HTML if template not found
            logger.LogWarning("Email template not found at {TemplatePath}, using fallback HTML", templatePath);
            body = GetFallbackEmailHtml(applicationName, inviter.FullName, invitation.IntendedRole, invitationLink, invitation.ExpiresAt);
        }

        // Load logo for attachment
        byte[]? logoBytes = null;
        string? logoFileName = null;
        
        var logoPath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Infrastructure", "EmailTemplates", "logo.svg");
        if (!File.Exists(logoPath)) {
            logoPath = Path.Combine(Directory.GetCurrentDirectory(), "Infrastructure", "EmailTemplates", "logo.svg");
        }
        
        if (File.Exists(logoPath)) {
            logoBytes = await File.ReadAllBytesAsync(logoPath, cancellationToken);
            logoFileName = "logo.svg";
        }
        else {
            logger.LogWarning("Logo file not found at {LogoPath}", logoPath);
        }

        await emailService.SendEmailAsync(
            invitation.Email,
            subject,
            body,
            attachment: logoBytes,
            attachmentName: logoFileName,
            cancellationToken: cancellationToken
        );
    }
    
    private string GetFallbackEmailHtml(string applicationName, string inviterName, string role, string invitationLink, DateTime expiresAt) {
        return $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #2563eb;'>Welcome to {applicationName}!</h2>
        <p>Hi there,</p>
        <p>{inviterName} has invited you to join {applicationName} as a <strong>{role}</strong>.</p>
        <p>To accept this invitation and create your account, please click the link below:</p>
        <div style='margin: 30px 0;'>
            <a href='{invitationLink}' style='background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                Accept Invitation
            </a>
        </div>
        <p style='color: #666; font-size: 14px;'>
            Or copy and paste this link into your browser:<br>
            <a href='{invitationLink}' style='color: #2563eb;'>{invitationLink}</a>
        </p>
        <p style='color: #dc2626; font-weight: bold;'>
            This invitation will expire on {expiresAt:MMMM dd, yyyy 'at' hh:mm tt 'UTC'}.
        </p>
        <p>If you believe this invitation was sent in error, you can safely ignore this email.</p>
    </div>
</body>
</html>";
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