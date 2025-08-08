using FluentValidation;
using Microsoft.Extensions.Localization;

namespace IntranetStarter.Application.Common.Validation;

/// <summary>
/// Extensions for enhanced validation with localization support
/// </summary>
public static class ValidationExtensions {
    /// <summary>
    /// Configure localized error message for validation rule
    /// </summary>
    public static IRuleBuilderOptions<T, TProperty> WithLocalizedMessage<T, TProperty>(
        this IRuleBuilderOptions<T, TProperty> rule,
        string                                 errorCode,
        IStringLocalizer?                      localizer = null) {
        if (localizer != null) {
            return rule.WithMessage(localizer[errorCode].Value)
                .WithErrorCode(errorCode);
        }

        return rule.WithErrorCode(errorCode);
    }

    /// <summary>
    /// Set validation error code for client-side handling
    /// </summary>
    public static IRuleBuilderOptions<T, TProperty> WithCode<T, TProperty>(
        this IRuleBuilderOptions<T, TProperty> rule,
        string                                 errorCode) {
        return rule.WithErrorCode(errorCode);
    }

    /// <summary>
    /// Add contextual validation information
    /// </summary>
    public static IRuleBuilderOptions<T, TProperty> WithContext<T, TProperty>(
        this IRuleBuilderOptions<T, TProperty> rule,
        string                                 key,
        object                                 value) {
        return rule.WithState(_ => new Dictionary<string, object> { { key, value } });
    }
}

/// <summary>
/// Common validation error codes for consistency
/// </summary>
public static class ValidationErrorCodes {
    public const string Required           = "FIELD_REQUIRED";
    public const string InvalidFormat      = "INVALID_FORMAT";
    public const string InvalidLength      = "INVALID_LENGTH";
    public const string InvalidRange       = "INVALID_RANGE";
    public const string InvalidEmail       = "INVALID_EMAIL";
    public const string InvalidUrl         = "INVALID_URL";
    public const string InvalidDate        = "INVALID_DATE";
    public const string InvalidPhoneNumber = "INVALID_PHONE";
    public const string DuplicateValue     = "DUPLICATE_VALUE";
    public const string InvalidReference   = "INVALID_REFERENCE";
    public const string InvalidPassword    = "INVALID_PASSWORD";
    public const string InvalidFileType    = "INVALID_FILE_TYPE";
    public const string InvalidFileSize    = "INVALID_FILE_SIZE";
    public const string BusinessRule       = "BUSINESS_RULE_VIOLATION";
}

/// <summary>
/// Localization keys for validation messages
/// </summary>
public static class ValidationMessageKeys {
    public const string RequiredField      = "Validation.RequiredField";
    public const string InvalidEmailFormat = "Validation.InvalidEmailFormat";
    public const string InvalidUrlFormat   = "Validation.InvalidUrlFormat";
    public const string InvalidDateFormat  = "Validation.InvalidDateFormat";
    public const string InvalidPhoneFormat = "Validation.InvalidPhoneFormat";
    public const string StringTooShort     = "Validation.StringTooShort";
    public const string StringTooLong      = "Validation.StringTooLong";
    public const string ValueTooSmall      = "Validation.ValueTooSmall";
    public const string ValueTooLarge      = "Validation.ValueTooLarge";
    public const string DuplicateValue     = "Validation.DuplicateValue";
    public const string InvalidReference   = "Validation.InvalidReference";
    public const string WeakPassword       = "Validation.WeakPassword";
    public const string InvalidFileType    = "Validation.InvalidFileType";
    public const string FileTooLarge       = "Validation.FileTooLarge";
}

/// <summary>
/// Helper class for creating structured validation failures
/// </summary>
public class ValidationFailureBuilder {
    private readonly List<FluentValidation.Results.ValidationFailure> _failures = new();

    public ValidationFailureBuilder AddError(string propertyName, string errorMessage, string errorCode) {
        _failures.Add(new FluentValidation.Results.ValidationFailure(propertyName, errorMessage) {
            ErrorCode = errorCode
        });
        return this;
    }

    public ValidationFailureBuilder AddError(string propertyName, string errorMessage, string errorCode, object attemptedValue) {
        _failures.Add(new FluentValidation.Results.ValidationFailure(propertyName, errorMessage, attemptedValue) {
            ErrorCode = errorCode
        });
        return this;
    }

    public List<FluentValidation.Results.ValidationFailure> Build() => _failures;

    public ValidationException BuildException() => new(_failures);
}