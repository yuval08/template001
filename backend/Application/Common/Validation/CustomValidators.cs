using FluentValidation;
using System.Text.RegularExpressions;

namespace IntranetStarter.Application.Common.Validation;

/// <summary>
/// Custom validators for common scenarios
/// </summary>
public static class CustomValidators
{
    /// <summary>
    /// Validates password strength
    /// </summary>
    public static IRuleBuilderOptions<T, string> MustBeStrongPassword<T>(
        this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .Must(BeStrongPassword)
            .WithCode(ValidationErrorCodes.InvalidPassword)
            .WithMessage("Password must be at least 8 characters and contain uppercase, lowercase, number, and special character");
    }

    /// <summary>
    /// Validates URL format
    /// </summary>
    public static IRuleBuilderOptions<T, string> MustBeValidUrl<T>(
        this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .Must(BeValidUrl)
            .WithCode(ValidationErrorCodes.InvalidUrl)
            .WithMessage("Invalid URL format");
    }

    /// <summary>
    /// Validates file extension
    /// </summary>
    public static IRuleBuilderOptions<T, string> MustHaveAllowedExtension<T>(
        this IRuleBuilder<T, string> ruleBuilder, 
        params string[] allowedExtensions)
    {
        return ruleBuilder
            .Must(filename => HaveAllowedExtension(filename, allowedExtensions))
            .WithCode(ValidationErrorCodes.InvalidFileType)
            .WithMessage($"File type must be one of: {string.Join(", ", allowedExtensions)}");
    }

    /// <summary>
    /// Validates that a string is a valid slug (URL-friendly)
    /// </summary>
    public static IRuleBuilderOptions<T, string> MustBeValidSlug<T>(
        this IRuleBuilder<T, string> ruleBuilder)
    {
        return ruleBuilder
            .Matches(@"^[a-z0-9]+(?:-[a-z0-9]+)*$")
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage("Must be lowercase letters, numbers, and hyphens only");
    }

    /// <summary>
    /// Validates business hours (9 AM to 6 PM)
    /// </summary>
    public static IRuleBuilderOptions<T, DateTime> MustBeWithinBusinessHours<T>(
        this IRuleBuilder<T, DateTime> ruleBuilder)
    {
        return ruleBuilder
            .Must(date => date.Hour >= 9 && date.Hour < 18)
            .WithCode(ValidationErrorCodes.BusinessRule)
            .WithMessage("Must be within business hours (9 AM to 6 PM)");
    }

    private static bool BeStrongPassword(string password)
    {
        if (string.IsNullOrEmpty(password) || password.Length < 8)
            return false;

        bool hasUpperCase = Regex.IsMatch(password, @"[A-Z]");
        bool hasLowerCase = Regex.IsMatch(password, @"[a-z]");
        bool hasDigit = Regex.IsMatch(password, @"\d");
        bool hasSpecialChar = Regex.IsMatch(password, @"[!@#$%^&*(),.?""':{}|<>]");

        return hasUpperCase && hasLowerCase && hasDigit && hasSpecialChar;
    }

    private static bool BeValidUrl(string url)
    {
        if (string.IsNullOrEmpty(url))
            return false;

        return Uri.TryCreate(url, UriKind.Absolute, out var result) &&
               (result.Scheme == Uri.UriSchemeHttp || result.Scheme == Uri.UriSchemeHttps);
    }

    private static bool HaveAllowedExtension(string filename, string[] allowedExtensions)
    {
        if (string.IsNullOrEmpty(filename))
            return false;

        string? extension = Path.GetExtension(filename)?.ToLowerInvariant();
        return allowedExtensions.Select(e => e.ToLowerInvariant()).Contains(extension);
    }
}

/// <summary>
/// Async custom validators for database or external service checks
/// </summary>
public static class AsyncCustomValidators
{
    /// <summary>
    /// Validates that an entity exists in the database
    /// </summary>
    public static IRuleBuilderOptions<T, TProperty> MustExistAsync<T, TProperty>(
        this IRuleBuilder<T, TProperty> ruleBuilder,
        Func<TProperty, CancellationToken, Task<bool>> predicate,
        string entityName)
    {
        return ruleBuilder
            .MustAsync(predicate)
            .WithCode(ValidationErrorCodes.InvalidReference)
            .WithMessage($"{entityName} does not exist");
    }

    /// <summary>
    /// Validates that a value is unique in the database
    /// </summary>
    public static IRuleBuilderOptions<T, TProperty> MustBeUniqueAsync<T, TProperty>(
        this IRuleBuilder<T, TProperty> ruleBuilder,
        Func<TProperty, CancellationToken, Task<bool>> predicate,
        string fieldName)
    {
        return ruleBuilder
            .MustAsync(predicate)
            .WithCode(ValidationErrorCodes.DuplicateValue)
            .WithMessage($"{fieldName} already exists");
    }
}