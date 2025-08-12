using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.Interfaces;

namespace IntranetStarter.Application.Features.Users.Commands.Validators;

public class DeleteUserCommandValidator : AbstractValidator<DeleteUserCommand> {
    public DeleteUserCommandValidator(ILocalizationService localizationService) {
        RuleFor(x => x.UserId)
        .NotEmpty()
        .WithCode(ValidationErrorCodes.Required)
        .WithMessage(localizationService.GetString("Validation.UserIdRequired"));

        RuleFor(x => x.DeletedBy)
        .NotEmpty()
        .WithCode(ValidationErrorCodes.Required)
        .WithMessage(localizationService.GetString("Validation.DeletedByRequired"));
    }
}