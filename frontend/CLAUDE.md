# Frontend Development Guidelines

This frontend follows an entity-based architecture with clear separation of concerns. For detailed documentation, see the `./docs/` folder.

## Quick Reference

- **[Project Structure](./docs/project-structure.md)** - Directory organization and architecture overview
- **[Data Tables](./docs/data-tables.md)** - Complete guide for implementing responsive data tables with filtering, sorting, and pagination
- **[Entity Development](./docs/entity-development.md)** - Step-by-step guide for creating new entities with API integration
- **[Forms](./docs/forms.md)** - Form handling with React Hook Form and Zod validation
- **[Authentication](./docs/authentication.md)** - Cookie-based auth, protected routes, and role-based access
- **[Common Patterns](./docs/common-patterns.md)** - Loading states, error handling, utilities, and reusable patterns

## Essential Commands

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Run tests
npm test

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## Quick Start for New Features

### 1. Adding a New Page

```tsx
// src/pages/YourPageName.tsx
import { useState, useEffect } from 'react';
import { useYourEntity } from '@/entities/your-entity/hooks';
import { Card } from '@/components/ui/card';

export default function YourPageName() {
  const { data, isLoading, error } = useYourEntity();
  
  if (isLoading) return <div>Loading...</div>;
  if (error) return <div>Error: {error.message}</div>;
  
  return (
    <div className="container mx-auto py-6">
      <h1 className="text-3xl font-bold mb-6">Your Page Title</h1>
      {/* Page content */}
    </div>
  );
}
```

### 2. Add Route

```tsx
// src/router.tsx
import YourPageName from '@/pages/YourPageName';

{
  path: '/your-route',
  element: (
    <PrivateRoute>
      <YourPageName />
    </PrivateRoute>
  ),
}
```

### 3. Add Navigation Link

```tsx
// src/components/Sidebar.tsx
<Link to="/your-route" className="nav-link">
  <Icon className="h-4 w-4" />
  Your Page Name
</Link>
```

## Key Patterns

- **Entity-based architecture**: Organize code by business entities
- **CQRS with React Query**: Separate queries and mutations
- **Cookie-based auth**: No manual token handling
- **Responsive design**: Desktop tables, mobile cards
- **Type safety**: Full TypeScript with Zod validation

## Common Mistakes to Avoid

❌ **DON'T** use axios directly
✅ **DO** extend `BaseApiService` or `CrudService`

❌ **DON'T** create service methods without proper typing
✅ **DO** define interfaces for all requests and responses

❌ **DON'T** forget to check authentication in React Query hooks
✅ **DO** use `enabled: isAuthenticated` in queries

❌ **DON'T** manually handle authentication tokens
✅ **DO** rely on cookie-based auth with `credentials: 'include'`

❌ **DON'T** create entity files in `/src/hooks/api/`
✅ **DO** use entity-based structure `/src/entities/[entity-name]/`

❌ **DON'T** forget error boundaries
✅ **DO** handle loading and error states in components

## Environment Variables

Create `.env.local` for local development:

```env
VITE_API_BASE_URL=http://localhost:5000
VITE_SIGNALR_URL=http://localhost:5000
```

Access in code:
```typescript
const apiUrl = import.meta.env.VITE_API_BASE_URL;
```

## UI Components

This project uses Shadcn/ui components. To add a new component:

```bash
npx shadcn-ui@latest add [component-name]
```

Available components are in `/src/components/ui/`

## Technology Stack

- **React 19** with TypeScript
- **Vite** for fast builds
- **TanStack Query** for data fetching
- **React Hook Form** with Zod validation
- **Zustand** for state management
- **TailwindCSS** with Shadcn/ui
- **TanStack Table** for data tables
- **React Router** for routing

## Need More Details?

Check the detailed documentation in the `./docs/` folder:
- Each guide includes complete code examples
- Step-by-step implementation instructions
- Best practices and common pitfalls
- Real-world usage patterns from the Users page implementation