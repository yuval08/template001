using System.Globalization;

namespace IntranetStarter.Application.Interfaces;

/// <summary>
/// Service for handling localization and resource management
/// </summary>
public interface ILocalizationService {
    /// <summary>
    /// Gets a localized string for the specified key
    /// </summary>
    /// <param name="key">The resource key</param>
    /// <returns>Localized string or the key if not found</returns>
    string GetString(string key);

    /// <summary>
    /// Gets a localized string for the specified key with the specified culture
    /// </summary>
    /// <param name="key">The resource key</param>
    /// <param name="culture">The culture to use for localization</param>
    /// <returns>Localized string or the key if not found</returns>
    string GetString(string key, CultureInfo culture);

    /// <summary>
    /// Gets a localized formatted string for the specified key with arguments
    /// </summary>
    /// <param name="key">The resource key</param>
    /// <param name="args">Arguments to format the string</param>
    /// <returns>Localized formatted string</returns>
    string GetString(string key, params object[] args);

    /// <summary>
    /// Gets a localized formatted string for the specified key with arguments and culture
    /// </summary>
    /// <param name="key">The resource key</param>
    /// <param name="culture">The culture to use for localization</param>
    /// <param name="args">Arguments to format the string</param>
    /// <returns>Localized formatted string</returns>
    string GetString(string key, CultureInfo culture, params object[] args);

    /// <summary>
    /// Gets the current culture
    /// </summary>
    /// <returns>Current culture</returns>
    CultureInfo GetCurrentCulture();

    /// <summary>
    /// Gets all supported cultures
    /// </summary>
    /// <returns>Array of supported cultures</returns>
    CultureInfo[] GetSupportedCultures();

    /// <summary>
    /// Checks if the specified culture is supported
    /// </summary>
    /// <param name="culture">Culture to check</param>
    /// <returns>True if supported, false otherwise</returns>
    bool IsCultureSupported(CultureInfo culture);

    /// <summary>
    /// Checks if the specified culture name is supported
    /// </summary>
    /// <param name="cultureName">Culture name to check</param>
    /// <returns>True if supported, false otherwise</returns>
    bool IsCultureSupported(string cultureName);
}