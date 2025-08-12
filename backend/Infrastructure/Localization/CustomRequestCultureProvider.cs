using System.Globalization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Localization;
using Microsoft.Extensions.Options;

namespace IntranetStarter.Infrastructure.Localization;

/// <summary>
/// Custom request culture provider that respects localization configuration
/// </summary>
public class CustomRequestCultureProvider(IOptions<LocalizationOptions> optionsConfiguration) : IRequestCultureProvider {
    private readonly LocalizationOptions options = optionsConfiguration.Value;

    public Task<ProviderCultureResult?> DetermineProviderCultureResult(HttpContext httpContext)
    {
        ArgumentNullException.ThrowIfNull(httpContext);
        
        // If multi-language is disabled, always use default language
        if (!options.EnableMultiLanguage)
        {
            var defaultCulture = options.DefaultLanguage;
            return Task.FromResult<ProviderCultureResult?>(new ProviderCultureResult(defaultCulture));
        }
        
        // Try to get culture from various sources in order of preference
        var culture = GetCultureFromSources(httpContext);
        
        // Validate that the culture is supported
        if (!string.IsNullOrEmpty(culture) && options.SupportedLanguages.Contains(culture, StringComparer.OrdinalIgnoreCase))
        {
            return Task.FromResult<ProviderCultureResult?>(new ProviderCultureResult(culture));
        }
        
        // Fall back to default language
        return Task.FromResult<ProviderCultureResult?>(new ProviderCultureResult(options.DefaultLanguage));
    }
    
    private string? GetCultureFromSources(HttpContext httpContext)
    {
        // 1. Try to get from query string parameter
        var cultureFromQuery = GetCultureFromQuery(httpContext);
        if (!string.IsNullOrEmpty(cultureFromQuery))
        {
            return cultureFromQuery;
        }
        
        // 2. Try to get from custom header
        var cultureFromHeader = GetCultureFromCustomHeader(httpContext);
        if (!string.IsNullOrEmpty(cultureFromHeader))
        {
            return cultureFromHeader;
        }
        
        // 3. Try to get from Accept-Language header if enabled
        if (options.UseAcceptLanguageHeader)
        {
            var cultureFromAcceptLanguage = GetCultureFromAcceptLanguage(httpContext);
            if (!string.IsNullOrEmpty(cultureFromAcceptLanguage))
            {
                return cultureFromAcceptLanguage;
            }
        }
        
        return null;
    }
    
    private static string? GetCultureFromQuery(HttpContext httpContext)
    {
        return httpContext.Request.Query["culture"].FirstOrDefault() ?? 
               httpContext.Request.Query["lang"].FirstOrDefault();
    }
    
    private static string? GetCultureFromCustomHeader(HttpContext httpContext)
    {
        return httpContext.Request.Headers["X-Culture"].FirstOrDefault() ??
               httpContext.Request.Headers["X-Language"].FirstOrDefault();
    }
    
    private string? GetCultureFromAcceptLanguage(HttpContext httpContext)
    {
        var acceptLanguageHeader = httpContext.Request.Headers.AcceptLanguage.FirstOrDefault();
        if (string.IsNullOrEmpty(acceptLanguageHeader))
        {
            return null;
        }
        
        // Parse Accept-Language header and find best match
        var acceptedLanguages = acceptLanguageHeader
            .Split(',')
            .Select(lang => lang.Split(';')[0].Trim())
            .Where(lang => !string.IsNullOrEmpty(lang));
        
        // Find the first supported language from Accept-Language header
        foreach (var acceptedLang in acceptedLanguages)
        {
            // Try exact match first
            if (options.SupportedLanguages.Contains(acceptedLang, StringComparer.OrdinalIgnoreCase))
            {
                return acceptedLang;
            }
            
            // Try culture match (e.g., "en" matches "en-US")
            var matchingCulture = options.SupportedLanguages
                .FirstOrDefault(supported => supported.StartsWith(acceptedLang + "-", StringComparison.OrdinalIgnoreCase));
            
            if (matchingCulture != null)
            {
                return matchingCulture;
            }
        }
        
        return null;
    }
}