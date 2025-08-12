using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.Features.Invitations.DTOs;
using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Constants;

namespace IntranetStarter.Application.Features.Invitations.Commands.Validators;

public class CreatePendingInvitationCommandValidator : AbstractValidator<CreatePendingInvitationCommand> {
    public CreatePendingInvitationCommandValidator(ILocalizationService localizationService) {
        RuleFor(x => x.Invitation)
        .NotNull()
        .WithCode(ValidationErrorCodes.Required)
        .WithMessage(localizationService.GetString("Validation.InvitationDataRequired"));

        When(x => x.Invitation != null, () =>
        {
            RuleFor(x => x.Invitation.Email)
            .NotEmpty()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(localizationService.GetString("Validation.EmailRequired"))
            .EmailAddress()
            .WithCode(ValidationErrorCodes.InvalidEmail)
            .WithMessage(localizationService.GetString("Validation.InvalidEmailFormat"))
            .MaximumLength(256)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(localizationService.GetString("Validation.EmailMaxLength", 256));

            RuleFor(x => x.Invitation.IntendedRole)
            .NotEmpty()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(localizationService.GetString("Validation.IntendedRoleRequired"))
            .Must(role => UserRoles.IsValidRole(role))
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage(localizationService.GetString("Validation.InvalidRole", string.Join(", ", UserRoles.All)));

            RuleFor(x => x.Invitation.InvitedById)
            .NotEqual(Guid.Empty)
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(localizationService.GetString("Validation.InviterIdRequired"));

            RuleFor(x => x.Invitation.ExpirationDays)
            .InclusiveBetween(1, 90)
            .WithCode(ValidationErrorCodes.InvalidRange)
            .WithMessage(localizationService.GetString("Validation.ExpirationDaysRange", 1, 90));

            // Custom business rule validation
            RuleFor(x => x.Invitation.Email)
            .Custom((email, context) =>
            {
                if (!string.IsNullOrEmpty(email)) {
                    string? domain = email.Split('@').LastOrDefault()?.ToLowerInvariant();

                    // Example: Block certain domains
                    string[] blockedDomains = ["tempmail.com", "guerrillamail.com", "10minutemail.com"];
                    if (blockedDomains.Contains(domain)) {
                        context.AddFailure(new FluentValidation.Results.ValidationFailure(
                            nameof(CreatePendingInvitationDto.Email),
                            localizationService.GetString("Validation.TempEmailNotAllowed"),
                            email) {
                            ErrorCode = ValidationErrorCodes.BusinessRule
                        });
                    }
                }
            });
        });
    }
}