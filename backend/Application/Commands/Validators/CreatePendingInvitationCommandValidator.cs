using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.DTOs;
using IntranetStarter.Domain.Constants;

namespace IntranetStarter.Application.Commands.Validators;

public class CreatePendingInvitationCommandValidator : AbstractValidator<CreatePendingInvitationCommand> {
    public CreatePendingInvitationCommandValidator() {
        RuleFor(x => x.Invitation)
            .NotNull()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("Invitation data is required");

        When(x => x.Invitation != null, () => {
            RuleFor(x => x.Invitation.Email)
                .NotEmpty()
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("Email is required")
                .EmailAddress()
                .WithCode(ValidationErrorCodes.InvalidEmail)
                .WithMessage("Invalid email format")
                .MaximumLength(256)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("Email must not exceed 256 characters");

            RuleFor(x => x.Invitation.IntendedRole)
                .NotEmpty()
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("Intended role is required")
                .Must(role => UserRoles.IsValidRole(role))
                .WithCode(ValidationErrorCodes.InvalidFormat)
                .WithMessage($"Invalid role. Must be one of: {string.Join(", ", UserRoles.All)}");

            RuleFor(x => x.Invitation.InvitedById)
                .NotEqual(Guid.Empty)
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("Inviter ID is required");

            RuleFor(x => x.Invitation.ExpirationDays)
                .InclusiveBetween(1, 90)
                .WithCode(ValidationErrorCodes.InvalidRange)
                .WithMessage("Expiration days must be between 1 and 90");

            // Custom business rule validation
            RuleFor(x => x.Invitation.Email)
                .Custom((email, context) => {
                    if (!string.IsNullOrEmpty(email)) {
                        string? domain = email.Split('@').LastOrDefault()?.ToLowerInvariant();

                        // Example: Block certain domains
                        string[] blockedDomains = ["tempmail.com", "guerrillamail.com", "10minutemail.com"];
                        if (blockedDomains.Contains(domain)) {
                            context.AddFailure(new FluentValidation.Results.ValidationFailure(
                                nameof(CreatePendingInvitationDto.Email),
                                "Temporary email addresses are not allowed",
                                email) {
                                ErrorCode = ValidationErrorCodes.BusinessRule
                            });
                        }
                    }
                });
        });
    }
}