using FluentValidation;
using IntranetStarter.Application.Common.Validation;

namespace IntranetStarter.Application.Commands.Validators;

public class MarkNotificationAsReadCommandValidator : AbstractValidator<MarkNotificationAsReadCommand> {
    public MarkNotificationAsReadCommandValidator() {
        RuleFor(x => x.NotificationId)
            .NotEqual(Guid.Empty)
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("Notification ID is required");

        RuleFor(x => x.UserId)
            .NotEqual(Guid.Empty)
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("User ID is required");
    }
}