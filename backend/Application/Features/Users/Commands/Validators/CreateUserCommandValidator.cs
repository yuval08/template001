using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.Features.Users.Commands;
using IntranetStarter.Domain.Constants;

namespace IntranetStarter.Application.Features.Users.Commands.Validators;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand> {
    public CreateUserCommandValidator() {
        RuleFor(x => x.User)
            .NotNull()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("User data is required");

        When(x => x.User != null, () => {
            RuleFor(x => x.User.Email)
                .NotEmpty()
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("Email is required")
                .EmailAddress()
                .WithCode(ValidationErrorCodes.InvalidEmail)
                .WithMessage("Invalid email format")
                .MaximumLength(256)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("Email must not exceed 256 characters");

            RuleFor(x => x.User.FirstName)
                .NotEmpty()
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("First name is required")
                .MaximumLength(100)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("First name must not exceed 100 characters")
                .Matches(@"^[a-zA-Z\s\-']+$")
                .WithCode(ValidationErrorCodes.InvalidFormat)
                .WithMessage("First name contains invalid characters");

            RuleFor(x => x.User.LastName)
                .NotEmpty()
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("Last name is required")
                .MaximumLength(100)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("Last name must not exceed 100 characters")
                .Matches(@"^[a-zA-Z\s\-']+$")
                .WithCode(ValidationErrorCodes.InvalidFormat)
                .WithMessage("Last name contains invalid characters");

            RuleFor(x => x.User.Role)
                .NotEmpty()
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("Role is required")
                .Must(role => UserRoles.IsValidRole(role))
                .WithCode(ValidationErrorCodes.InvalidFormat)
                .WithMessage($"Invalid role. Must be one of: {string.Join(", ", UserRoles.All)}");

            RuleFor(x => x.User.Department)
                .MaximumLength(100)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("Department must not exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.User.Department));

            RuleFor(x => x.User.JobTitle)
                .MaximumLength(100)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("Job title must not exceed 100 characters")
                .When(x => !string.IsNullOrEmpty(x.User.JobTitle));
        });
    }
}