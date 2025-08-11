# Project Structure

This frontend follows an entity-based architecture with clear separation of concerns. **IMPORTANT**: Follow this structure exactly when adding new features.

## Directory Organization

```
frontend/src/
├── entities/          # Entity-specific modules (services, hooks, types)
├── pages/            # Page components (routes)
├── components/       # Reusable UI components
├── stores/           # Zustand state stores
├── hooks/            # Global hooks (not entity-specific)
├── shared/           # Shared utilities, types, and services
├── layouts/          # Layout components
└── router.tsx        # Route definitions
```

## Entity-Based Architecture

The application is organized around business entities (users, projects, reports, etc.). Each entity has its own module containing:

- **Types**: TypeScript interfaces and types
- **Services**: API integration classes
- **Hooks**: React Query hooks for data fetching
- **Components**: Entity-specific UI components (optional)

Example structure for a "User" entity:
```
entities/user/
├── types/
│   └── user.types.ts
├── services/
│   └── user.service.ts
├── hooks/
│   └── user.hooks.ts
├── components/        # Optional
│   ├── UserCard.tsx
│   └── UserForm.tsx
└── index.ts          # Barrel export
```

## Key Directories

### `/src/entities/`
Business entity modules with complete encapsulation of domain logic.

### `/src/pages/`
Page components that correspond to routes. These orchestrate entity components and handle page-level state.

### `/src/components/`
Reusable UI components that are not entity-specific. Includes both custom components and Shadcn/ui components.

### `/src/stores/`
Zustand stores for global state management. Use sparingly - prefer React Query for server state.

### `/src/shared/`
Shared utilities, types, and base classes used across the application:
- `api/`: Base API service classes
- `types/`: Common TypeScript types
- `utils/`: Utility functions

## File Naming Conventions

- **Pages**: PascalCase - `YourPageName.tsx`
- **Components**: PascalCase - `YourComponent.tsx`
- **Hooks**: camelCase with 'use' prefix - `useYourHook.ts`
- **Services**: kebab-case - `your-entity.service.ts`
- **Types**: kebab-case - `your-entity.types.ts`
- **Stores**: kebab-case - `your-entity.store.ts`

## Import Aliases

The project uses TypeScript path aliases for cleaner imports:
- `@/` - Maps to `src/`
- Example: `import { Button } from '@/components/ui/button'`