# Language Configuration Guide

This guide explains how to configure language settings for both single-language and multi-language deployments of the application.

## Table of Contents
- [Overview](#overview)
- [Frontend Configuration](#frontend-configuration)
- [Backend Configuration](#backend-configuration)
- [Configuration Scenarios](#configuration-scenarios)
- [Testing Your Configuration](#testing-your-configuration)
- [Adding New Languages](#adding-new-languages)

## Overview

The application supports flexible language configuration allowing you to:
- Deploy as a single-language application (e.g., Spanish-only)
- Deploy with multi-language support and language switching
- Configure default languages for both frontend and backend
- Control how language preferences are detected and applied

## Frontend Configuration

### Environment Variables

Configure language settings in your `.env` file:

```env
# Enable/disable multi-language support
VITE_MULTI_LANGUAGE_ENABLED=true

# Set default language (en for English, es for Spanish)
VITE_DEFAULT_LANGUAGE=en

# Available languages (comma-separated)
VITE_AVAILABLE_LANGUAGES=en,es
```

### Single-Language Mode (Spanish Only)

To deploy the frontend in Spanish-only mode:

```env
VITE_MULTI_LANGUAGE_ENABLED=false
VITE_DEFAULT_LANGUAGE=es
VITE_AVAILABLE_LANGUAGES=es
```

**Effect:**
- Language switcher will be hidden
- All content displayed in Spanish
- No language switching available to users

### Single-Language Mode (English Only)

To deploy the frontend in English-only mode:

```env
VITE_MULTI_LANGUAGE_ENABLED=false
VITE_DEFAULT_LANGUAGE=en
VITE_AVAILABLE_LANGUAGES=en
```

**Effect:**
- Language switcher will be hidden
- All content displayed in English
- No language switching available to users

### Multi-Language Mode

To enable language switching between English and Spanish:

```env
VITE_MULTI_LANGUAGE_ENABLED=true
VITE_DEFAULT_LANGUAGE=en
VITE_AVAILABLE_LANGUAGES=en,es
```

**Effect:**
- Language switcher visible in navbar
- Users can switch between English and Spanish
- Language preference saved in cookies
- Default language used for new visitors

## Backend Configuration

### Application Settings

Configure backend localization in `appsettings.json`:

```json
{
  "Localization": {
    "DefaultLanguage": "en-US",
    "SupportedLanguages": ["en-US", "es-ES"],
    "EnableMultiLanguage": true,
    "UseAcceptLanguageHeader": true,
    "FallbackToDefaultLanguage": true
  },
  "Email": {
    "DefaultCulture": "en-US"
  }
}
```

### Configuration Options Explained

| Setting | Description | Default |
|---------|-------------|---------|
| `DefaultLanguage` | Default language/culture for the application | `"en-US"` |
| `SupportedLanguages` | Array of supported language codes | `["en-US", "es-ES"]` |
| `EnableMultiLanguage` | Enable/disable multi-language support | `true` |
| `UseAcceptLanguageHeader` | Use browser's Accept-Language header | `true` |
| `FallbackToDefaultLanguage` | Fallback to default if translation missing | `true` |
| `Email.DefaultCulture` | Default culture for email templates | `"en-US"` |

### Single-Language Backend (Spanish Only)

```json
{
  "Localization": {
    "DefaultLanguage": "es-ES",
    "SupportedLanguages": ["es-ES"],
    "EnableMultiLanguage": false,
    "UseAcceptLanguageHeader": false,
    "FallbackToDefaultLanguage": true
  },
  "Email": {
    "DefaultCulture": "es-ES"
  }
}
```

### Single-Language Backend (English Only)

```json
{
  "Localization": {
    "DefaultLanguage": "en-US",
    "SupportedLanguages": ["en-US"],
    "EnableMultiLanguage": false,
    "UseAcceptLanguageHeader": false,
    "FallbackToDefaultLanguage": true
  },
  "Email": {
    "DefaultCulture": "en-US"
  }
}
```

### Multi-Language Backend

```json
{
  "Localization": {
    "DefaultLanguage": "en-US",
    "SupportedLanguages": ["en-US", "es-ES"],
    "EnableMultiLanguage": true,
    "UseAcceptLanguageHeader": true,
    "FallbackToDefaultLanguage": true
  },
  "Email": {
    "DefaultCulture": "en-US"
  }
}
```

## Configuration Scenarios

### Scenario 1: Corporate Spanish-Only Deployment

**Use Case:** Company operating only in Spanish-speaking regions

**Frontend (.env):**
```env
VITE_MULTI_LANGUAGE_ENABLED=false
VITE_DEFAULT_LANGUAGE=es
VITE_AVAILABLE_LANGUAGES=es
```

**Backend (appsettings.json):**
```json
{
  "Localization": {
    "DefaultLanguage": "es-ES",
    "SupportedLanguages": ["es-ES"],
    "EnableMultiLanguage": false
  }
}
```

### Scenario 2: International Multi-Language Deployment

**Use Case:** Global company with users in multiple regions

**Frontend (.env):**
```env
VITE_MULTI_LANGUAGE_ENABLED=true
VITE_DEFAULT_LANGUAGE=en
VITE_AVAILABLE_LANGUAGES=en,es
```

**Backend (appsettings.json):**
```json
{
  "Localization": {
    "DefaultLanguage": "en-US",
    "SupportedLanguages": ["en-US", "es-ES"],
    "EnableMultiLanguage": true,
    "UseAcceptLanguageHeader": true
  }
}
```

### Scenario 3: Regional Deployment with Fallback

**Use Case:** Spanish-first deployment with English fallback

**Frontend (.env):**
```env
VITE_MULTI_LANGUAGE_ENABLED=true
VITE_DEFAULT_LANGUAGE=es
VITE_AVAILABLE_LANGUAGES=es,en
```

**Backend (appsettings.json):**
```json
{
  "Localization": {
    "DefaultLanguage": "es-ES",
    "SupportedLanguages": ["es-ES", "en-US"],
    "EnableMultiLanguage": true,
    "UseAcceptLanguageHeader": true
  }
}
```

## How Language Selection Works

### Frontend Language Resolution

1. **Cookie Check**: First checks for saved language preference in cookies
2. **Environment Default**: Falls back to `VITE_DEFAULT_LANGUAGE`
3. **Language Switcher**: User can manually change (if multi-language enabled)

### Backend Language Resolution Priority

When `EnableMultiLanguage` is `true`:

1. **Query String**: `?culture=es-ES` or `?lang=es-ES`
2. **Custom Headers**: `X-Culture: es-ES` or `X-Language: es-ES`
3. **Accept-Language Header**: Standard HTTP header (if enabled)
4. **Cookie**: Previously saved preference
5. **Default Language**: Final fallback

When `EnableMultiLanguage` is `false`:
- Always uses `DefaultLanguage` regardless of request headers

## Testing Your Configuration

### Testing Frontend Language

**Single Language Mode:**
```bash
# Should not see language switcher
# All content in configured language
npm run dev
```

**Multi-Language Mode:**
```bash
# Should see language switcher in navbar
# Can switch between languages
# Language persists after refresh
npm run dev
```

### Testing Backend Language

**Test with cURL:**

```bash
# Test Spanish response
curl -H "Accept-Language: es-ES" http://localhost:5000/api/users

# Test with query parameter
curl http://localhost:5000/api/users?culture=es-ES

# Test with custom header
curl -H "X-Culture: es-ES" http://localhost:5000/api/users
```

**Test Validation Messages:**

```bash
# Should return Spanish validation errors
curl -X POST http://localhost:5000/api/users \
  -H "Content-Type: application/json" \
  -H "Accept-Language: es-ES" \
  -d '{"user": {}}'
```

### Testing Email Templates

Emails will use the appropriate template based on:
1. Email domain detection (e.g., `.es` domains get Spanish)
2. Configured `Email.DefaultCulture`
3. Fallback to `Localization.DefaultLanguage`

## Adding New Languages

### Step 1: Frontend

1. Add translation files:
   ```
   frontend/src/i18n/locales/fr/
   ├── common.json
   ├── dashboard.json
   ├── projects.json
   └── ... (all namespaces)
   ```

2. Update i18n configuration:
   ```typescript
   // frontend/src/i18n/index.ts
   import frCommon from './locales/fr/common.json';
   // ... import all French translations
   
   resources: {
     fr: {
       common: frCommon,
       // ... add all namespaces
     }
   }
   ```

3. Update environment variables:
   ```env
   VITE_AVAILABLE_LANGUAGES=en,es,fr
   ```

### Step 2: Backend

1. Add resource file:
   ```
   backend/Infrastructure/Resources/SharedResources.fr-FR.resx
   ```

2. Update configuration:
   ```json
   {
     "Localization": {
       "SupportedLanguages": ["en-US", "es-ES", "fr-FR"]
     }
   }
   ```

3. Add email template (optional):
   ```
   backend/Infrastructure/EmailTemplates/InvitationEmail.fr-FR.html
   ```

## Troubleshooting

### Issue: Language switcher not appearing

**Solution:** Check that `VITE_MULTI_LANGUAGE_ENABLED=true` in your `.env` file

### Issue: Backend always returns English

**Solutions:**
1. Verify `EnableMultiLanguage: true` in appsettings.json
2. Check that culture is in `SupportedLanguages` array
3. Ensure proper culture format (e.g., `es-ES` not just `es`)

### Issue: Translations not loading

**Solutions:**
1. Check browser console for 404 errors on translation files
2. Verify translation files exist in correct location
3. Ensure namespace is properly registered in i18n configuration

### Issue: Email templates in wrong language

**Solutions:**
1. Check `Email.DefaultCulture` setting
2. Verify culture-specific template exists (e.g., `InvitationEmail.es-ES.html`)
3. Check email domain detection logic in `CreatePendingInvitationCommand`

## Best Practices

1. **Consistency**: Keep frontend and backend language settings aligned
2. **Testing**: Always test language switching after configuration changes
3. **Fallbacks**: Enable fallback options to prevent missing translations
4. **Documentation**: Document your language configuration for your team
5. **Monitoring**: Log language resolution to debug issues in production

## Environment-Specific Configuration

### Development
- Enable multi-language for testing all scenarios
- Use verbose logging for language resolution
- Test with various Accept-Language headers

### Staging
- Match production configuration
- Test specific regional settings
- Verify email templates in all languages

### Production
- Set appropriate defaults for your primary market
- Monitor for missing translation keys
- Consider CDN caching for translation files