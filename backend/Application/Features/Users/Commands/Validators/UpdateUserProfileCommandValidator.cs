using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.Interfaces;

namespace IntranetStarter.Application.Features.Users.Commands.Validators;

public class UpdateUserProfileCommandValidator : AbstractValidator<UpdateUserProfileCommand> {
    public UpdateUserProfileCommandValidator(ILocalizationService localizationService) {
        var service = localizationService;
        RuleFor(x => x.UserProfile)
        .NotNull()
        .WithCode(ValidationErrorCodes.Required)
        .WithMessage(service.GetString("Validation.UserDataRequired"));

        When(x => x.UserProfile != null, () =>
        {
            RuleFor(x => x.UserProfile.UserId)
            .NotEqual(Guid.Empty)
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(service.GetString("Validation.UserIdRequired"));

            RuleFor(x => x.UserProfile.FirstName)
            .NotEmpty()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(service.GetString("Validation.FirstNameRequired"))
            .MaximumLength(100)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(service.GetString("Validation.FirstNameMaxLength", 100))
            .Matches(@"^[a-zA-Z\s\-']+$")
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage(service.GetString("Validation.FirstNameInvalidChars"));

            RuleFor(x => x.UserProfile.LastName)
            .NotEmpty()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(service.GetString("Validation.LastNameRequired"))
            .MaximumLength(100)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(service.GetString("Validation.LastNameMaxLength", 100))
            .Matches(@"^[a-zA-Z\s\-']+$")
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage(service.GetString("Validation.LastNameInvalidChars"));

            RuleFor(x => x.UserProfile.Department)
            .MaximumLength(100)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(service.GetString("Validation.DepartmentMaxLength", 100))
            .When(x => !string.IsNullOrEmpty(x.UserProfile.Department));

            RuleFor(x => x.UserProfile.JobTitle)
            .MaximumLength(100)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(service.GetString("Validation.JobTitleMaxLength", 100))
            .When(x => !string.IsNullOrEmpty(x.UserProfile.JobTitle));
        });
    }
}