using System.Globalization;
using System.Resources;
using IntranetStarter.Application.Interfaces;
using Microsoft.Extensions.Localization;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;

namespace IntranetStarter.Infrastructure.Localization;

/// <summary>
/// Implementation of localization service using resource files
/// </summary>
public class LocalizationService(IStringLocalizer<SharedResources> localizer, IOptions<LocalizationOptions> optionsConfiguration, ILogger<LocalizationService> logger) : ILocalizationService {
    private readonly LocalizationOptions options = optionsConfiguration.Value;

    public string GetString(string key) {
        if (string.IsNullOrWhiteSpace(key)) {
            logger.LogWarning("Localization key is null or empty");
            return key ?? string.Empty;
        }

        try {
            var localizedString = localizer[key];

            // If resource not found and fallback is enabled, log the missing resource
            if (localizedString.ResourceNotFound) {
                logger.LogWarning("Resource not found for key: {Key} in culture: {Culture}",
                    key, CultureInfo.CurrentCulture.Name);

                return options.FallbackToDefaultLanguage ? key : localizedString.Value;
            }

            return localizedString.Value;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving localized string for key: {Key}", key);
            return key;
        }
    }

    public string GetString(string key, CultureInfo culture) {
        if (string.IsNullOrWhiteSpace(key)) {
            logger.LogWarning("Localization key is null or empty");
            return key ?? string.Empty;
        }

        if (culture == null) {
            return GetString(key);
        }

        try {
            var originalCulture = CultureInfo.CurrentCulture;
            var originalUICulture = CultureInfo.CurrentUICulture;

            try {
                // Temporarily set the culture
                CultureInfo.CurrentCulture = culture;
                CultureInfo.CurrentUICulture = culture;

                return GetString(key);
            }
            finally {
                // Restore original culture
                CultureInfo.CurrentCulture = originalCulture;
                CultureInfo.CurrentUICulture = originalUICulture;
            }
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving localized string for key: {Key} with culture: {Culture}",
                key, culture.Name);

            return key;
        }
    }

    public string GetString(string key, params object[] args) {
        if (args == null || args.Length == 0) {
            return GetString(key);
        }

        try {
            var format = GetString(key);
            return string.Format(format, args);
        }
        catch (FormatException ex) {
            logger.LogError(ex, "Format error in localized string for key: {Key} with args: {@Args}",
                key, args);

            return key;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error formatting localized string for key: {Key}", key);
            return key;
        }
    }

    public string GetString(string key, CultureInfo culture, params object[] args) {
        if (args == null || args.Length == 0) {
            return GetString(key, culture);
        }

        try {
            var format = GetString(key, culture);
            return string.Format(culture, format, args);
        }
        catch (FormatException ex) {
            logger.LogError(ex, "Format error in localized string for key: {Key} with culture: {Culture} and args: {@Args}",
                key, culture.Name, args);

            return key;
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error formatting localized string for key: {Key} with culture: {Culture}",
                key, culture.Name);

            return key;
        }
    }

    public CultureInfo GetCurrentCulture() {
        return CultureInfo.CurrentCulture;
    }

    public CultureInfo[] GetSupportedCultures() {
        return options.GetSupportedCultures();
    }

    public bool IsCultureSupported(CultureInfo culture) {
        if (culture == null)
            return false;

        return IsCultureSupported(culture.Name);
    }

    public bool IsCultureSupported(string cultureName) {
        if (string.IsNullOrWhiteSpace(cultureName))
            return false;

        return options.SupportedLanguages.Contains(cultureName, StringComparer.OrdinalIgnoreCase);
    }
}

/// <summary>
/// Marker class for shared resources
/// </summary>
public class SharedResources {
}