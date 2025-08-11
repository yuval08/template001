using FluentValidation;
using IntranetStarter.Application.Common.Validation;

namespace IntranetStarter.Application.Features.Users.Commands.Validators;

public class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand> {
    public UpdateUserProfileCommandValidator() {
        RuleFor(x => x.UserProfile)
            .NotNull()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("User profile data is required");

        When(x => x.UserProfile != null, () => {
            RuleFor(x => x.UserProfile.UserId)
                .NotEqual(Guid.Empty)
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("User ID is required");

            RuleFor(x => x.UserProfile.FirstName)
                .NotEmpty()
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("First name is required")
                .MaximumLength(100)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("First name must not exceed 100 characters")
                .Matches(@"^[a-zA-Z\s\-']+$")
                .WithCode(ValidationErrorCodes.InvalidFormat)
                .WithMessage("First name contains invalid characters");

            RuleFor(x => x.UserProfile.LastName)
                .NotEmpty()
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("Last name is required")
                .MaximumLength(100)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("Last name must not exceed 100 characters")
                .Matches(@"^[a-zA-Z\s\-']+$")
                .WithCode(ValidationErrorCodes.InvalidFormat)
                .WithMessage("Last name contains invalid characters");

            RuleFor(x => x.UserProfile.Department)
                .MaximumLength(100)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("Department must not exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.UserProfile.Department));

            RuleFor(x => x.UserProfile.JobTitle)
                .MaximumLength(100)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("Job title must not exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.UserProfile.JobTitle));
        });
    }
}