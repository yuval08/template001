using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.Interfaces;

namespace IntranetStarter.Application.Features.Notifications.Commands.Validators;

public class CreateNotificationCommandValidator : AbstractValidator<CreateNotificationCommand> {
    public CreateNotificationCommandValidator(ILocalizationService localizationService) {
        RuleFor(x => x.UserId)
        .NotEqual(Guid.Empty)
        .WithCode(ValidationErrorCodes.Required)
        .WithMessage(localizationService.GetString("Validation.UserIdRequired"));

        RuleFor(x => x.Title)
        .NotEmpty()
        .WithCode(ValidationErrorCodes.Required)
        .WithMessage(localizationService.GetString("Validation.NotificationTitleRequired"))
        .MaximumLength(200)
        .WithCode(ValidationErrorCodes.InvalidLength)
        .WithMessage(localizationService.GetString("Validation.TitleMaxLength", 200));

        RuleFor(x => x.Message)
        .NotEmpty()
        .WithCode(ValidationErrorCodes.Required)
        .WithMessage(localizationService.GetString("Validation.NotificationMessageRequired"))
        .MaximumLength(1000)
        .WithCode(ValidationErrorCodes.InvalidLength)
        .WithMessage(localizationService.GetString("Validation.MessageMaxLength", 1000));

        RuleFor(x => x.Type)
        .IsInEnum()
        .WithCode(ValidationErrorCodes.InvalidFormat)
        .WithMessage(localizationService.GetString("Validation.InvalidNotificationType"));

        RuleFor(x => x.ActionUrl)
        .MaximumLength(500)
        .WithCode(ValidationErrorCodes.InvalidLength)
        .WithMessage(localizationService.GetString("Validation.ActionUrlMaxLength", 500))
        .When(x => !string.IsNullOrEmpty(x.ActionUrl));

        RuleFor(x => x.ActionUrl)
        .Must(BeAValidUrl)
        .WithCode(ValidationErrorCodes.InvalidFormat)
        .WithMessage(localizationService.GetString("Validation.InvalidActionUrl"))
        .When(x => !string.IsNullOrEmpty(x.ActionUrl));

        RuleFor(x => x.Metadata)
        .MaximumLength(2000)
        .WithCode(ValidationErrorCodes.InvalidLength)
        .WithMessage(localizationService.GetString("Validation.MetadataMaxLength", 2000))
        .When(x => !string.IsNullOrEmpty(x.Metadata));

        RuleFor(x => x.Metadata)
        .Must(BeValidJson)
        .WithCode(ValidationErrorCodes.InvalidFormat)
        .WithMessage(localizationService.GetString("Validation.InvalidJsonMetadata"))
        .When(x => !string.IsNullOrEmpty(x.Metadata));
    }

    private bool BeAValidUrl(string? url) {
        if (string.IsNullOrWhiteSpace(url)) return true;

        // Allow relative URLs for internal navigation (e.g., /dashboard, /users)
        if (url.StartsWith("/")) return true;

        // Check for absolute URLs
        return Uri.TryCreate(url, UriKind.Absolute, out var result) &&
               (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }

    private bool BeValidJson(string? json) {
        if (string.IsNullOrWhiteSpace(json)) return true;
        try {
            System.Text.Json.JsonDocument.Parse(json);
            return true;
        }
        catch {
            return false;
        }
    }
}