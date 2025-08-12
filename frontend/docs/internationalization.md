# Internationalization (i18n) Guide

This guide covers the complete internationalization setup for the application, including UI translations, date/number formatting, and configuration options.

## Quick Start

### Using Translations in Components

```tsx
import { useTranslation } from 'react-i18next';

export function MyComponent() {
  const { t, i18n } = useTranslation();
  
  return (
    <div>
      <h1>{t('common.welcome')}</h1>
      <p>{t('dashboard.description')}</p>
      <button onClick={() => i18n.changeLanguage('es')}>
        {t('common.changeLanguage')}
      </button>
    </div>
  );
}
```

### Date and Number Formatting

```tsx
import { 
  formatDateLocale, 
  formatNumberLocale, 
  formatCurrencyLocale 
} from '@/utils/locale';

// Format dates using system locale
const date = formatDateLocale(new Date()); // "Dec 8, 2024"

// Format numbers with locale-specific separators
const number = formatNumberLocale(1234.56); // "1,234.56" or "1.234,56"

// Format currency
const price = formatCurrencyLocale(99.99, 'USD'); // "$99.99"
```

## Architecture

### File Structure

```
frontend/src/
├── i18n/
│   ├── index.ts                 # i18n configuration
│   └── locales/
│       ├── en/                  # English translations
│       │   ├── common.json
│       │   ├── auth.json
│       │   ├── dashboard.json
│       │   └── ...
│       └── es/                  # Spanish translations
│           ├── common.json
│           ├── auth.json
│           ├── dashboard.json
│           └── ...
└── utils/
    ├── locale.ts                # Formatting utilities
    └── pluralization.ts         # Pluralization rules
```

### Translation Namespaces

| Namespace | Purpose | Example Keys |
|-----------|---------|--------------|
| `common` | Shared UI elements | `save`, `cancel`, `loading` |
| `auth` | Authentication | `login`, `logout`, `profile` |
| `layout` | Layout components | `navigation`, `sidebar`, `header` |
| `dashboard` | Dashboard page | `widgets`, `charts`, `stats` |
| `users` | User management | `table`, `forms`, `roles` |
| `projects` | Projects page | `list`, `create`, `edit` |
| `notifications` | Notifications | `inbox`, `alerts`, `messages` |

## Configuration

### Environment Variables

```env
# Default language (es or en)
VITE_DEFAULT_LANGUAGE=es

# Enable language switcher
VITE_MULTI_LANGUAGE_ENABLED=true
```

### Single Language Mode

For deployments requiring only one language:

```env
VITE_DEFAULT_LANGUAGE=es
VITE_MULTI_LANGUAGE_ENABLED=false
```

This will:
- Set Spanish as the only language
- Hide the language switcher
- Reduce bundle size slightly

### Multi-Language Mode

For international deployments:

```env
VITE_DEFAULT_LANGUAGE=en
VITE_MULTI_LANGUAGE_ENABLED=true
```

## Adding Translations

### 1. Add Translation Keys

Edit the appropriate JSON file:

```json
// src/i18n/locales/en/dashboard.json
{
  "newFeature": {
    "title": "New Feature",
    "description": "This is a new feature"
  }
}

// src/i18n/locales/es/dashboard.json
{
  "newFeature": {
    "title": "Nueva Característica",
    "description": "Esta es una nueva característica"
  }
}
```

### 2. Use in Component

```tsx
const { t } = useTranslation('dashboard');

return <h1>{t('newFeature.title')}</h1>;
```

### 3. TypeScript Support

The system provides type safety for translation keys:

```tsx
// ✅ TypeScript will validate this key exists
t('dashboard.newFeature.title')

// ❌ TypeScript will show error for invalid key
t('dashboard.nonExistentKey')
```

## Advanced Features

### Interpolation

Pass variables to translations:

```json
// Translation file
{
  "welcome": "Welcome, {{name}}!",
  "itemCount": "You have {{count}} items"
}
```

```tsx
// Usage
t('welcome', { name: 'John' }) // "Welcome, John!"
t('itemCount', { count: 5 })    // "You have 5 items"
```

### Pluralization

Handle singular/plural forms:

```json
// Translation file
{
  "item_one": "{{count}} item",
  "item_other": "{{count}} items"
}
```

```tsx
// Usage
t('item', { count: 1 }) // "1 item"
t('item', { count: 5 }) // "5 items"
```

### Nested Keys

Access deeply nested translations:

```json
{
  "forms": {
    "validation": {
      "required": "This field is required",
      "email": "Invalid email address"
    }
  }
}
```

```tsx
t('forms.validation.required')
t('forms.validation.email')
```

## Date and Number Formatting

### System Locale Preservation

The application preserves the user's system locale for formatting while allowing independent UI language selection:

- **UI Language**: Controls text content (English/Spanish)
- **System Locale**: Controls date/number formatting (based on OS/browser)

### Formatting Functions

```tsx
import * as locale from '@/utils/locale';

// Date formatting
locale.formatDateLocale(date)        // "Dec 8, 2024"
locale.formatDateTimeLocale(date)    // "Dec 8, 2024, 3:30 PM"
locale.formatRelativeTimeLocale(date) // "2 hours ago"

// Number formatting
locale.formatNumberLocale(1234.56)   // "1,234.56"
locale.formatCurrencyLocale(99.99)   // "$99.99"
locale.formatPercentageLocale(0.85)  // "85%"

// Get current locale info
locale.getUserLocale()                // "en-US"
locale.getLocaleInfo()                // Detailed locale information
```

### Custom Formatting Options

```tsx
// Custom date format
formatDateLocale(date, {
  weekday: 'long',
  year: 'numeric',
  month: 'long',
  day: 'numeric'
}); // "Sunday, December 8, 2024"

// Custom number format
formatNumberLocale(1234.5678, {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2
}); // "1,234.57"

// Different currency
formatCurrencyLocale(99.99, 'EUR'); // "€99.99"
```

## Backend Integration

### API Response Localization

The backend respects the `Accept-Language` header:

```tsx
// Automatically sent with requests
fetch('/api/data', {
  headers: {
    'Accept-Language': i18n.language
  }
});
```

### Email Localization

Emails are sent in the user's preferred language:

```csharp
// Backend automatically uses user's language preference
await _emailService.SendInvitationEmailAsync(user);
```

## Testing

### Manual Testing

1. Navigate to `/locale-test` to view comprehensive formatting tests
2. Switch languages using the language selector in the navbar
3. Verify all UI elements update correctly

### Test Checklist

- [ ] All UI text updates when language changes
- [ ] Dates display in correct format for locale
- [ ] Numbers use appropriate separators
- [ ] Language preference persists after reload
- [ ] API responses return localized content
- [ ] Emails sent in correct language

## Performance

### Bundle Impact

- **Total i18n overhead**: ~61 KB gzipped
- **Performance impact**: Negligible (<10ms initialization)
- **Language switching**: Instant (no network requests)

See [Performance Report](../docs/i18n-performance-report.md) for detailed analysis.

## Common Issues and Solutions

### Missing Translations

If a translation key is missing:
1. Check browser console for warnings
2. Add the missing key to both language files
3. Restart dev server if needed

### Date Formatting Issues

If dates show incorrectly:
1. Verify browser locale settings
2. Check that date is valid JavaScript Date object
3. Use `formatDateLocale()` instead of `toLocaleDateString()`

### Language Not Persisting

If language resets on reload:
1. Check cookies are enabled
2. Verify `VITE_MULTI_LANGUAGE_ENABLED=true`
3. Check browser developer tools for cookie

## Adding a New Language

To add a new language (e.g., French):

1. **Create translation files**:
   ```
   src/i18n/locales/fr/
   ├── common.json
   ├── auth.json
   └── ... (copy structure from en/)
   ```

2. **Update i18n configuration**:
   ```tsx
   // src/i18n/index.ts
   import frCommon from './locales/fr/common.json';
   // ... import other fr files

   const resources = {
     en: { /* ... */ },
     es: { /* ... */ },
     fr: {
       common: frCommon,
       // ... other namespaces
     }
   };
   ```

3. **Add to available languages**:
   ```tsx
   export const getAvailableLanguages = () => ['en', 'es', 'fr'];
   ```

4. **Update language switcher** if needed

## Best Practices

1. **Keep translations organized** by feature/page
2. **Use namespaces** to avoid key conflicts
3. **Implement early** in new features
4. **Test with longest translations** to catch UI issues
5. **Use interpolation** instead of concatenation
6. **Validate translations** during build process
7. **Document context** for translators with comments

## Resources

- [Configuration Guide](../docs/language-configuration-guide.md) - Customer setup instructions
- [Performance Report](../docs/i18n-performance-report.md) - Bundle size analysis
- [Locale Test Results](../docs/locale-test-results.md) - Formatting test results
- [react-i18next Documentation](https://react.i18next.com/)
- [i18next Documentation](https://www.i18next.com/)