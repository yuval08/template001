# Spanish Pluralization Guide

This guide explains how Spanish pluralization is implemented in the React application using react-i18next.

## Spanish Pluralization Rules

Spanish follows simple pluralization rules compared to other languages:

- **Singular (one)**: Used when count = 1 (e.g., "1 usuario")
- **Plural (other)**: Used when count ≠ 1 (e.g., "0 usuarios", "2 usuarios", "5 usuarios")

Unlike English, Spanish doesn't have a separate zero form - zero uses the plural form.

## Implementation Overview

### 1. i18next Configuration

The i18n configuration (`src/i18n/index.ts`) is set up to handle Spanish pluralization:

```typescript
i18n.init({
  // Spanish pluralization rules are handled automatically by i18next
  // Spanish uses: one (n = 1), other (n != 1)
  pluralSeparator: '_',
  keySeparator: '.',
  nsSeparator: ':',
  debug: process.env.NODE_ENV === 'development',
});
```

### 2. Translation Key Structure

Translation keys follow the pattern: `key_one` and `key_other`

**Example in `es/users.json`:**
```json
{
  "counts": {
    "total_users_one": "{{count}} usuario en total",
    "total_users_other": "{{count}} usuarios en total"
  }
}
```

### 3. Usage in Components

#### Basic Usage with useTranslation

```tsx
import { useTranslation } from 'react-i18next';

const MyComponent = () => {
  const { t } = useTranslation(['users']);
  const userCount = 5;
  
  return (
    <div>
      {/* This will automatically select the correct plural form */}
      <p>{t('users:counts.total_users', { count: userCount })}</p>
      {/* Output: "5 usuarios en total" */}
    </div>
  );
};
```

#### Using Utility Functions

```tsx
import { useTranslation } from 'react-i18next';
import { SpanishPluralPatterns } from '@/utils/pluralization';

const MyComponent = () => {
  const { t } = useTranslation(['users']);
  const userCount = 1;
  
  return (
    <div>
      <p>{SpanishPluralPatterns.users(t, userCount)}</p>
      {/* Output: "1 usuario en total" */}
    </div>
  );
};
```

## Translation Keys by Category

### Common Counts (`common.json`)

```json
{
  "counts": {
    "items_one": "{{count}} elemento",
    "items_other": "{{count}} elementos",
    "results_one": "{{count}} resultado",
    "results_other": "{{count}} resultados",
    "records_one": "{{count}} registro",
    "records_other": "{{count}} registros"
  },
  "time": {
    "minutes_ago_one": "Hace {{count}} minuto",
    "minutes_ago_other": "Hace {{count}} minutos",
    "hours_ago_one": "Hace {{count}} hora",
    "hours_ago_other": "Hace {{count}} horas"
  }
}
```

### User-specific (`users.json`)

```json
{
  "table": {
    "pagination_info_one": "Mostrando {{start}} a {{end}} de {{total}} usuario",
    "pagination_info_other": "Mostrando {{start}} a {{end}} de {{total}} usuarios"
  },
  "counts": {
    "active_users_one": "{{count}} usuario activo",
    "active_users_other": "{{count}} usuarios activos",
    "total_users_one": "{{count}} usuario en total",
    "total_users_other": "{{count}} usuarios en total"
  }
}
```

### Project-specific (`projects.json`)

```json
{
  "counts": {
    "active_projects_one": "{{count}} proyecto activo",
    "active_projects_other": "{{count}} proyectos activos",
    "total_projects_one": "{{count}} proyecto en total",
    "total_projects_other": "{{count}} proyectos en total"
  }
}
```

### Notification-specific (`notifications.json`)

```json
{
  "counts": {
    "unread_notifications_one": "{{count}} notificación sin leer",
    "unread_notifications_other": "{{count}} notificaciones sin leer"
  }
}
```

## Testing Pluralization

### Test Cases for Spanish Pluralization

You should test the following scenarios:

1. **Count = 0**: Should use plural form
   - Input: `t('users:counts.total_users', { count: 0 })`
   - Expected: "0 usuarios en total"

2. **Count = 1**: Should use singular form
   - Input: `t('users:counts.total_users', { count: 1 })`
   - Expected: "1 usuario en total"

3. **Count = 2**: Should use plural form
   - Input: `t('users:counts.total_users', { count: 2 })`
   - Expected: "2 usuarios en total"

4. **Count > 2**: Should use plural form
   - Input: `t('users:counts.total_users', { count: 10 })`
   - Expected: "10 usuarios en total"

### Testing Component Example

```tsx
import { render, screen } from '@testing-library/react';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/i18n';

const TestComponent = ({ count }: { count: number }) => {
  const { t } = useTranslation(['users']);
  return <div>{t('users:counts.total_users', { count })}</div>;
};

describe('Spanish Pluralization', () => {
  it('should use singular form for count = 1', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <TestComponent count={1} />
      </I18nextProvider>
    );
    expect(screen.getByText('1 usuario en total')).toBeInTheDocument();
  });

  it('should use plural form for count = 0', () => {
    render(
      <I18nextProvider i18n={i18n}>
        <TestComponent count={0} />
      </I18nextProvider>
    );
    expect(screen.getByText('0 usuarios en total')).toBeInTheDocument();
  });
});
```

## Common Patterns and Best Practices

### 1. Pagination Text

For pagination, always include start, end, and total parameters:

```tsx
const paginationText = t('users:table.pagination_info', {
  count: totalCount,
  start: pagination.pageIndex * pagination.pageSize + 1,
  end: Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount),
  total: totalCount
});
```

### 2. Message Notifications

For success/error messages with counts:

```tsx
// Good: Uses proper pluralization
const message = t('users:messages.users_deleted', { count: deletedCount });

// Bad: Hardcoded pluralization
const message = `${deletedCount} usuario${deletedCount !== 1 ? 's' : ''} eliminado${deletedCount !== 1 ? 's' : ''}`;
```

### 3. Table Headers and Labels

Always use translation keys for table headers and labels:

```tsx
// Good
header: t('users:table.headers.name')

// Bad
header: 'Name'
```

### 4. Status and Count Displays

For displaying counts with status:

```tsx
// Good: Proper pluralization with status
const activeUsersText = t('users:counts.active_users', { count: activeCount });

// Bad: Manual string concatenation
const activeUsersText = `${activeCount} usuario${activeCount !== 1 ? 's' : ''} activo${activeCount !== 1 ? 's' : ''}`;
```

## Utility Functions

The `src/utils/pluralization.ts` file provides helper functions:

### SpanishPluralPatterns

Pre-defined patterns for common entities:

```tsx
import { SpanishPluralPatterns } from '@/utils/pluralization';

// Usage
SpanishPluralPatterns.users(t, 5);           // "5 usuarios en total"
SpanishPluralPatterns.activeUsers(t, 1);     // "1 usuario activo"
SpanishPluralPatterns.notifications(t, 0);   // "0 notificaciones totales"
```

### formatPaginationText

Formats pagination text with proper pluralization:

```tsx
import { formatPaginationText } from '@/utils/pluralization';

const paginationText = formatPaginationText(t, 1, 10, 25, 'users');
// Output: "Mostrando 1 a 10 de 25 usuarios"
```

### translateWithCount

Generic helper for any pluralization:

```tsx
import { translateWithCount } from '@/utils/pluralization';

const text = translateWithCount(t, 'users:counts.selected_users', selectedCount);
```

## Migration from Manual Pluralization

If you have existing manual pluralization code, here's how to migrate:

### Before (Manual)
```tsx
const getUsersText = (count: number) => {
  return count === 1 ? `${count} usuario` : `${count} usuarios`;
};
```

### After (i18next)
```tsx
const getUsersText = (count: number) => {
  return t('users:counts.total_users', { count });
};
```

## Debugging

### Common Issues

1. **Missing Translation Keys**: Check browser console for warnings about missing keys
2. **Incorrect Pluralization**: Verify the `_one` and `_other` suffixes in translation files
3. **Wrong Namespace**: Ensure you're loading the correct translation namespace

### Debug Mode

Enable debug mode in development:

```typescript
i18n.init({
  debug: process.env.NODE_ENV === 'development',
  // This will log missing keys and pluralization decisions
});
```

### Browser DevTools

You can inspect i18next behavior in browser console:

```javascript
// Check current language
i18n.language

// Check if a key exists
i18n.exists('users:counts.total_users_one')

// Get raw translation without interpolation
i18n.t('users:counts.total_users', { count: 1, lng: 'es' })
```

## Performance Considerations

1. **Namespace Loading**: Only load required namespaces to reduce bundle size
2. **Translation Caching**: i18next automatically caches translations
3. **Component Re-renders**: Use React.memo() for components that frequently change counts

## Future Enhancements

1. **Number Formatting**: Add locale-specific number formatting for Spanish
2. **Date Pluralization**: Extend to handle date-based pluralization
3. **Regional Variants**: Support for different Spanish dialects (es-MX, es-AR, etc.)

## Conclusion

This implementation provides a robust, maintainable approach to Spanish pluralization that:

- Follows i18next best practices
- Handles all Spanish pluralization scenarios
- Provides utility functions for common patterns
- Is easily testable and debuggable
- Can be extended for additional languages

For any questions or issues with Spanish pluralization, refer to this guide or check the implementation in `src/utils/pluralization.ts`.