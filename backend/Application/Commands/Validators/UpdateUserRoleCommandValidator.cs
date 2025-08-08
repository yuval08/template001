using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Domain.Constants;

namespace IntranetStarter.Application.Commands.Validators;

public class UpdateUserRoleCommandValidator : AbstractValidator<UpdateUserRoleCommand> {
    public UpdateUserRoleCommandValidator() {
        RuleFor(x => x.UserRole)
            .NotNull()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("User role data is required");

        When(x => x.UserRole != null, () => {
            RuleFor(x => x.UserRole.UserId)
                .NotEqual(Guid.Empty)
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("User ID is required");

            RuleFor(x => x.UserRole.UpdatedById)
                .NotEqual(Guid.Empty)
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("Updater ID is required");

            RuleFor(x => x.UserRole.NewRole)
                .NotEmpty()
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("New role is required")
                .Must(UserRoles.IsValidRole)
                .WithCode(ValidationErrorCodes.InvalidFormat)
                .WithMessage($"Invalid role. Must be one of: {string.Join(", ", UserRoles.All)}");

            // Business rule: Cannot modify own admin role
            RuleFor(x => x.UserRole)
                .Must(ur => ur.UserId != ur.UpdatedById || ur.NewRole == "Admin")
                .WithCode(ValidationErrorCodes.BusinessRule)
                .WithMessage("Users cannot remove their own admin role")
                .When(x => x.UserRole.UserId == x.UserRole.UpdatedById);
        });
    }
}