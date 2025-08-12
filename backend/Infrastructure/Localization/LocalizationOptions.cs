using System.Globalization;

namespace IntranetStarter.Infrastructure.Localization;

/// <summary>
/// Configuration options for localization settings
/// </summary>
public class LocalizationOptions {
    public const string SectionName = "Localization";

    /// <summary>
    /// The default language/culture for the application (e.g., "en-US", "es-ES")
    /// </summary>
    public string DefaultLanguage { get; set; } = "en-US";

    /// <summary>
    /// List of supported languages/cultures
    /// </summary>
    public string[] SupportedLanguages { get; set; } = ["en-US", "es-ES"];

    /// <summary>
    /// Whether to enable multi-language support
    /// When false, only the default language will be used
    /// </summary>
    public bool EnableMultiLanguage { get; set; } = true;

    /// <summary>
    /// Whether to use Accept-Language header for culture selection
    /// </summary>
    public bool UseAcceptLanguageHeader { get; set; } = true;

    /// <summary>
    /// Whether to fallback to default language when a resource is not found
    /// </summary>
    public bool FallbackToDefaultLanguage { get; set; } = true;

    /// <summary>
    /// Gets the supported cultures as CultureInfo objects
    /// </summary>
    public CultureInfo[] GetSupportedCultures() {
        return SupportedLanguages
        .Where(lang => !string.IsNullOrWhiteSpace(lang))
        .Select(lang => new CultureInfo(lang))
        .ToArray();
    }

    /// <summary>
    /// Gets the default culture as CultureInfo object
    /// </summary>
    public CultureInfo GetDefaultCulture() {
        return new CultureInfo(DefaultLanguage);
    }

    /// <summary>
    /// Validates the localization configuration
    /// </summary>
    public void Validate() {
        if (string.IsNullOrWhiteSpace(DefaultLanguage))
            throw new InvalidOperationException("DefaultLanguage cannot be null or empty");

        if (SupportedLanguages == null || SupportedLanguages.Length == 0)
            throw new InvalidOperationException("SupportedLanguages cannot be null or empty");

        if (!SupportedLanguages.Contains(DefaultLanguage))
            throw new InvalidOperationException($"DefaultLanguage '{DefaultLanguage}' must be included in SupportedLanguages");

        // Validate that all supported languages are valid culture names
        foreach (var language in SupportedLanguages.Where(l => !string.IsNullOrWhiteSpace(l))) {
            try {
                _ = new CultureInfo(language);
            }
            catch (CultureNotFoundException ex) {
                throw new InvalidOperationException($"Invalid culture name '{language}' in SupportedLanguages", ex);
            }
        }
    }
}