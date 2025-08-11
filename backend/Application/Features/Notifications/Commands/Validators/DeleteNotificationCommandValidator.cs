using FluentValidation;
using IntranetStarter.Application.Common.Validation;

namespace IntranetStarter.Application.Features.Notifications.Commands.Validators;

public class DeleteNotificationCommandValidator : AbstractValidator<DeleteNotificationCommand> {
    public DeleteNotificationCommandValidator() {
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