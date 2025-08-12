using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Constants;

namespace IntranetStarter.Application.Features.Users.Commands.Validators;

public class UpdateUserRoleCommandValidator : AbstractValidator<UpdateUserRoleCommand> {
    public UpdateUserRoleCommandValidator(ILocalizationService localizationService) {
        var service = localizationService;

        RuleFor(x => x.UserRole)
        .NotNull()
        .WithCode(ValidationErrorCodes.Required)
        .WithMessage(service.GetString("Validation.UserRoleDataRequired"));

        When(x => x.UserRole != null, () =>
        {
            RuleFor(x => x.UserRole.UserId)
            .NotEqual(Guid.Empty)
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(service.GetString("Validation.UserIdRequired"));

            RuleFor(x => x.UserRole.UpdatedById)
            .NotEqual(Guid.Empty)
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(service.GetString("Validation.UpdaterIdRequired"));

            RuleFor(x => x.UserRole.NewRole)
            .NotEmpty()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(service.GetString("Validation.NewRoleRequired"))
            .Must(UserRoles.IsValidRole)
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage(service.GetString("Validation.InvalidRole", string.Join(", ", UserRoles.All)));

            // Business rule: Cannot modify own admin role
            RuleFor(x => x.UserRole)
            .Must(ur => ur.UserId != ur.UpdatedById || ur.NewRole == "Admin")
            .WithCode(ValidationErrorCodes.BusinessRule)
            .WithMessage(service.GetString("Validation.CannotRemoveOwnAdminRole"))
            .When(x => x.UserRole.UserId == x.UserRole.UpdatedById);
        });
    }
}