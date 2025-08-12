using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Constants;

namespace IntranetStarter.Application.Features.Users.Commands.Validators;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand> {
    public CreateUserCommandValidator(ILocalizationService localizationService) {
        RuleFor(x => x.User)
        .NotNull()
        .WithCode(ValidationErrorCodes.Required)
        .WithMessage(localizationService.GetString("Validation.UserDataRequired"));

        When(x => x.User != null, () =>
        {
            RuleFor(x => x.User.Email)
            .NotEmpty()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(localizationService.GetString("Validation.EmailRequired"))
            .EmailAddress()
            .WithCode(ValidationErrorCodes.InvalidEmail)
            .WithMessage(localizationService.GetString("Validation.InvalidEmailFormat"))
            .MaximumLength(256)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(localizationService.GetString("Validation.EmailMaxLength", 256));

            RuleFor(x => x.User.FirstName)
            .NotEmpty()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(localizationService.GetString("Validation.FirstNameRequired"))
            .MaximumLength(100)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(localizationService.GetString("Validation.FirstNameMaxLength", 100))
            .Matches(@"^[a-zA-Z\s\-']+$")
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage(localizationService.GetString("Validation.FirstNameInvalidChars"));

            RuleFor(x => x.User.LastName)
            .NotEmpty()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(localizationService.GetString("Validation.LastNameRequired"))
            .MaximumLength(100)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(localizationService.GetString("Validation.LastNameMaxLength", 100))
            .Matches(@"^[a-zA-Z\s\-']+$")
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage(localizationService.GetString("Validation.LastNameInvalidChars"));

            RuleFor(x => x.User.Role)
            .NotEmpty()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(localizationService.GetString("Validation.RoleRequired"))
            .Must(role => UserRoles.IsValidRole(role))
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage(localizationService.GetString("Validation.InvalidRole", string.Join(", ", UserRoles.All)));

            RuleFor(x => x.User.Department)
            .MaximumLength(100)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(localizationService.GetString("Validation.DepartmentMaxLength", 100))
            .When(x => !string.IsNullOrEmpty(x.User.Department));

            RuleFor(x => x.User.JobTitle)
            .MaximumLength(100)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(localizationService.GetString("Validation.JobTitleMaxLength", 100))
            .When(x => !string.IsNullOrEmpty(x.User.JobTitle));
        });
    }
}