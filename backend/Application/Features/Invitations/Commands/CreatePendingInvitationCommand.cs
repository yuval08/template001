using IntranetStarter.Application.Features.Invitations.DTOs;
using IntranetStarter.Application.Features.Users.Mappers;
using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Constants;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Logging;
using System.Linq;
using IntranetStarter.Application.Features.Invitations.Mappers;

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

        var userRepository = unitOfWork.Repository<User>();
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
            Email = request.Invitation.Email,
            IntendedRole = request.Invitation.IntendedRole,
            InvitedById = request.Invitation.InvitedById,
            InvitedAt = DateTime.UtcNow,
            ExpiresAt = DateTime.UtcNow.AddDays(request.Invitation.ExpirationDays),
            IsUsed = false
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

        return createdInvitation.MapToDto();
    }

    private async Task SendInvitationEmailAsync(PendingInvitation invitation, User inviter, CancellationToken cancellationToken) {
        var applicationName = configuration["ApplicationName"] ?? "Intranet Starter";
        var applicationUrl = configuration["ApplicationUrl"] ?? "http://localhost:3000";

        // Create the invitation link (this could include a token or invitation ID for validation)
        var invitationLink = $"{applicationUrl}/login?accept-invitation=true&id={invitation.Id}";

        // Get culture preference (can be extended to use user preferences, browser locale, etc.)
        var culture = GetEmailCulture(invitation.Email);
        var subject = GetLocalizedSubject(applicationName, culture);

        // Load the appropriate localized HTML template
        var templatePath = GetEmailTemplatePath("InvitationEmail", culture);

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
            body = GetFallbackEmailHtml(applicationName, inviter.FullName, invitation.IntendedRole, invitationLink, invitation.ExpiresAt, culture);
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

    private string GetFallbackEmailHtml(string applicationName, string inviterName, string role, string invitationLink, DateTime expiresAt, string culture) {
        return culture switch {
            "es-ES" => GetFallbackEmailHtmlSpanish(applicationName, inviterName, role, invitationLink, expiresAt),
            _ => GetFallbackEmailHtmlEnglish(applicationName, inviterName, role, invitationLink, expiresAt)
        };
    }

    private string GetFallbackEmailHtmlEnglish(string applicationName, string inviterName, string role, string invitationLink, DateTime expiresAt) {
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

    private string GetFallbackEmailHtmlSpanish(string applicationName, string inviterName, string role, string invitationLink, DateTime expiresAt) {
        return $@"
<html>
<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333;'>
    <div style='max-width: 600px; margin: 0 auto; padding: 20px;'>
        <h2 style='color: #2563eb;'>¡Bienvenido a {applicationName}!</h2>
        <p>Hola,</p>
        <p>{inviterName} te ha invitado a unirte a {applicationName} como <strong>{role}</strong>.</p>
        <p>Para aceptar esta invitación y crear tu cuenta, haz clic en el enlace de abajo:</p>
        <div style='margin: 30px 0;'>
            <a href='{invitationLink}' style='background-color: #2563eb; color: white; padding: 12px 24px; text-decoration: none; border-radius: 5px; display: inline-block;'>
                Aceptar Invitación
            </a>
        </div>
        <p style='color: #666; font-size: 14px;'>
            O copia y pega este enlace en tu navegador:<br>
            <a href='{invitationLink}' style='color: #2563eb;'>{invitationLink}</a>
        </p>
        <p style='color: #dc2626; font-weight: bold;'>
            Esta invitación caducará el {expiresAt:MMMM dd, yyyy 'at' hh:mm tt 'UTC'}.
        </p>
        <p>Si crees que esta invitación se envió por error, puedes ignorar este correo de forma segura.</p>
    </div>
</body>
</html>";
    }

    private string GetEmailCulture(string email) {
        // Default culture logic - can be extended based on:
        // - User preferences stored in database
        // - Domain-based defaults (e.g., .es emails get Spanish)
        // - Configuration settings
        // - HTTP Accept-Language header (for web-based invitations)

        var defaultCulture = configuration["Email:DefaultCulture"] ??
                             configuration["Localization:DefaultLanguage"] ??
                             "en-US";

        // Get supported languages from configuration
        var supportedLanguagesSection = configuration.GetSection("Localization:SupportedLanguages");
        var supportedLanguages = supportedLanguagesSection.GetChildren()
        .Select(x => x.Value)
        .Where(x => !string.IsNullOrEmpty(x))
        .ToArray();

        if (supportedLanguages.Length == 0) {
            supportedLanguages = new[] { "en-US" };
        }

        // Simple domain-based culture detection
        string detectedCulture = defaultCulture;

        if (email.EndsWith(".es", StringComparison.OrdinalIgnoreCase) ||
            email.Contains("@empresaespañola.") ||
            email.Contains("@spanish")) {
            detectedCulture = "es-ES";
        }

        // Add more culture detection logic as needed
        // if (email.EndsWith(".fr", StringComparison.OrdinalIgnoreCase)) detectedCulture = "fr-FR";
        // if (email.EndsWith(".de", StringComparison.OrdinalIgnoreCase)) detectedCulture = "de-DE";

        // Validate that detected culture is supported
        if (supportedLanguages.Contains(detectedCulture, StringComparer.OrdinalIgnoreCase)) {
            return detectedCulture;
        }

        logger.LogInformation("Detected culture {DetectedCulture} for email {Email} is not supported. Using default culture {DefaultCulture}",
            detectedCulture, email, defaultCulture);

        return defaultCulture;
    }

    private string GetLocalizedSubject(string applicationName, string culture) {
        return culture switch {
            "es-ES" => $"Te han invitado a unirte a {applicationName}",
            "en-US" or _ => $"You've been invited to join {applicationName}"
        };
    }

    private string GetEmailTemplatePath(string templateName, string culture) {
        // Try culture-specific template first
        var localizedTemplateName = $"{templateName}.{culture}.html";
        var templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Infrastructure", "EmailTemplates", localizedTemplateName);

        if (!File.Exists(templatePath)) {
            // Fallback to current directory
            templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Infrastructure", "EmailTemplates", localizedTemplateName);
        }

        if (!File.Exists(templatePath)) {
            // Fallback to default template
            var defaultTemplateName = $"{templateName}.html";
            templatePath = Path.Combine(AppDomain.CurrentDomain.BaseDirectory, "Infrastructure", "EmailTemplates", defaultTemplateName);

            if (!File.Exists(templatePath)) {
                templatePath = Path.Combine(Directory.GetCurrentDirectory(), "Infrastructure", "EmailTemplates", defaultTemplateName);
            }

            logger.LogInformation("Culture-specific template not found for {Culture}, falling back to default template: {TemplatePath}", culture, templatePath);
        }
        else {
            logger.LogInformation("Using localized email template for culture {Culture}: {TemplatePath}", culture, templatePath);
        }

        return templatePath;
    }

}