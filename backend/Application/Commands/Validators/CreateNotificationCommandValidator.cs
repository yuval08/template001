using FluentValidation;
using IntranetStarter.Application.Common.Validation;

namespace IntranetStarter.Application.Commands.Validators;

public class CreateNotificationCommandValidator : AbstractValidator<CreateNotificationCommand> {
    public CreateNotificationCommandValidator() {
        RuleFor(x => x.UserId)
            .NotEqual(Guid.Empty)
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("User ID is required");

        RuleFor(x => x.Title)
            .NotEmpty()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("Notification title is required")
            .MaximumLength(200)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage("Title must not exceed 200 characters");

        RuleFor(x => x.Message)
            .NotEmpty()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("Notification message is required")
            .MaximumLength(1000)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage("Message must not exceed 1000 characters");

        RuleFor(x => x.Type)
            .IsInEnum()
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage("Invalid notification type");

        RuleFor(x => x.ActionUrl)
            .MaximumLength(500)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage("Action URL must not exceed 500 characters")
            .When(x => !string.IsNullOrEmpty(x.ActionUrl));

        RuleFor(x => x.ActionUrl)
            .Must(BeAValidUrl)
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage("Action URL must be a valid URL")
            .When(x => !string.IsNullOrEmpty(x.ActionUrl));

        RuleFor(x => x.Metadata)
            .MaximumLength(2000)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage("Metadata must not exceed 2000 characters")
            .When(x => !string.IsNullOrEmpty(x.Metadata));

        RuleFor(x => x.Metadata)
            .Must(BeValidJson)
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage("Metadata must be valid JSON")
            .When(x => !string.IsNullOrEmpty(x.Metadata));
    }

    private bool BeAValidUrl(string? url) {
        if (string.IsNullOrWhiteSpace(url)) return true;
        return Uri.TryCreate(url, UriKind.Absolute, out var result) &&
               (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }

    private bool BeValidJson(string? json) {
        if (string.IsNullOrWhiteSpace(json)) return true;
        try {
            System.Text.Json.JsonDocument.Parse(json);
            return true;
        } catch {
            return false;
        }
    }
}