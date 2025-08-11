# Universal Search System Documentation

## 1. System Overview

### Architecture

The Universal Search System is a comprehensive, extensible search solution that provides a unified search experience across multiple entity types in the application. It leverages a combination of frontend and backend technologies to deliver fast, relevant search results.

#### Key Components

1. **Frontend**:
   - `GlobalSearch` component
   - `CommandPalette` with keyboard navigation
   - Search hooks and services
   - Local storage for recent searches

2. **Backend**:
   - `/api/search` endpoint
   - CQRS pattern implementation
   - Extensible search query system

### Data Flow Diagram

```
User Input 
  ↓
Debounced Search Input 
  ↓
Search Service Invocation
  ↓
API Request (/api/search)
  ↓
Backend Search Processing
  ↓
Filtered, Ranked Results
  ↓
Frontend Rendering
```

### Integration Points

- React Query for caching and state management
- Local storage for recent searches
- Decoupled search service with dependency injection
- Centralized entity type management

## 2. Usage Guide

### Global Search Functionality

#### Keyboard Shortcuts
- `Ctrl+K` or `Cmd+K`: Open Command Palette
- `↑` / `↓`: Navigate search results
- `Enter`: Select highlighted result
- `Esc`: Close search or clear input

#### Interaction Patterns
- Minimum 2 characters required to trigger search
- Real-time suggestions
- Recent searches persistence
- Entity type filtering

#### Mobile vs Desktop
- Responsive design
- Touch-friendly on mobile
- Full keyboard navigation on desktop

## 3. Extension Guidelines

### Backend: Adding New Searchable Entities

1. Implement `ISearchableEntity` interface
   ```csharp
   public interface ISearchableEntity {
       string Id { get; }
       string Title { get; }
       string Description { get; }
       SearchEntityType EntityType { get; }
       string NavigationUrl { get; }
   }
   ```

2. Update `SearchEntityType` enum
   ```typescript
   export enum SearchEntityType {
     // Existing types
     NewEntity = 'NewEntity'
   }
   ```

3. Create mapper and query modifications
   - Extend `GetUniversalSearchQuery`
   - Add repository method for new entity
   - Implement search logic

### Frontend: Adding New Commands

1. Extend `NavigationCommand` interface
2. Update `useNavigationCommands` hook
   ```typescript
   {
     id: 'new-command',
     title: 'New Command',
     description: 'Description of new command',
     navigationUrl: '/new-path',
     category: 'pages',
     keywords: ['keyword1', 'keyword2'],
     icon: 'new-icon'
   }
   ```

## 4. API Reference

### Search Endpoint: `/api/search`

#### Request Parameters
- `searchTerm`: string (required)
- `page`: number (optional, default: 1)
- `pageSize`: number (optional, default: 10)
- `entityTypes`: SearchEntityType[] (optional)

#### Response Structure
```typescript
interface SearchResult {
  id: string;
  title: string;
  description: string;
  entityType: SearchEntityType;
  navigationUrl: string;
  relevanceScore: number;
  metadata?: {
    additionalData: Record<string, any>
  }
}
```

#### Error Handling
- 400: Invalid search parameters
- 500: Server-side search processing error

## 5. Component Reference

### GlobalSearch Component

#### Props
- `onSearch`: Callback function
- `placeholder`: Custom placeholder text
- `maxResults`: Maximum number of results

### CommandPalette

#### Features
- Keyboard navigation
- Recent searches
- Entity type filtering
- Customizable styling

## 6. Implementation Examples

### Adding a New Searchable Entity

1. Backend: Create entity mapper
2. Frontend: Update search types
3. Implement search logic
4. Add navigation command

### Performance Optimization

- Use React Query caching
- Implement server-side pagination
- Add relevance scoring
- Optimize database queries

### Testing Strategies

- Unit tests for search hooks
- Integration tests for API endpoint
- Performance benchmarking
- Accessibility testing

## Best Practices

- Keep search queries concise
- Implement server-side filtering
- Use consistent relevance scoring
- Provide meaningful navigation URLs
- Handle edge cases gracefully

---

**Note**: This documentation is a living document. Always refer to the latest version in the repository.