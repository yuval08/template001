# Universal Search Components

This directory contains the frontend universal search components that integrate with the backend search endpoint.

## Components

### GlobalSearch
- **Location**: `./GlobalSearch.tsx`
- **Purpose**: Main search input component with debounced search and dropdown results
- **Features**:
  - Debounced search (300ms delay) to avoid excessive API calls
  - Dropdown results with keyboard navigation (arrow keys, enter, escape)
  - Recent searches stored in localStorage
  - Responsive design with mobile considerations
  - Integration with command palette hint

### SearchResults
- **Location**: `./SearchResults.tsx`
- **Purpose**: Displays search results and recent searches in organized groups
- **Features**:
  - Groups results by entity type (Project, User, Document, Task)
  - Shows recent searches when no search term
  - Loading states and error handling
  - Keyboard navigation support
  - Results count and metadata display

### SearchItem
- **Location**: `./SearchItem.tsx`
- **Purpose**: Individual search result item component
- **Features**:
  - Entity type icons and color coding
  - Relevance score display (dev mode only)
  - Accessible with proper ARIA attributes
  - Click and keyboard navigation support
  - Date formatting for created/updated times

### CommandPalette
- **Location**: `./CommandPalette.tsx`
- **Purpose**: Full-screen modal search with keyboard shortcuts
- **Features**:
  - Global Ctrl+K / Cmd+K shortcut activation
  - Combines search results with navigation commands
  - Categories: "Pages", "Search Results", "Recent"
  - Keyboard navigation with arrow keys and tab cycling
  - Command registry system for easy extension

## Integration

### Topbar Integration
The search components are integrated into the existing Topbar component:
- Search input displayed between mobile menu and right actions
- Hidden on mobile screens (< md breakpoint)
- Global command palette accessible via keyboard shortcut

### Backend Integration
- **Search Endpoint**: `/api/search`
- **Suggestions Endpoint**: `/api/search/suggestions`
- **Entity Types Endpoint**: `/api/search/entity-types`
- Response includes: `id`, `entityType`, `title`, `description`, `navigationUrl`, `relevanceScore`, `metadata`

### State Management
- Uses TanStack Query for data fetching and caching
- Recent searches stored in localStorage (max 10 items)
- Zustand integration following existing patterns
- Service container pattern with dependency injection

## Entity Structure

### Types
- **SearchResult**: Main result interface
- **SearchEntityType**: Enum for entity types
- **RecentSearch**: Recent search persistence
- **NavigationCommand**: Command palette navigation items

### Services
- **SearchService**: API integration following existing patterns
- Extends BaseApiService with proper error handling
- Caching and deduplication via React Query

### Hooks
- **useSearch**: Main search hook with caching
- **useSearchSuggestions**: Debounced suggestions
- **useRecentSearches**: localStorage persistence
- **useNavigationCommands**: Command registry
- **useCommandPalette**: Global keyboard handling
- **useDebounce**: Utility hook for input debouncing

## Accessibility Features

- Proper ARIA attributes and roles
- Keyboard navigation support
- Focus management
- Screen reader friendly
- High contrast support
- Semantic HTML structure

## Mobile Responsiveness

- Search input hidden on mobile (< md breakpoint)
- Command palette accessible on all screen sizes
- Touch-friendly interaction targets
- Responsive typography and spacing
- Optimized for mobile performance

## Usage Examples

### Basic Search Integration
```tsx
import { GlobalSearch } from '@/components/search';

function MyComponent() {
  return (
    <GlobalSearch 
      placeholder="Search everything..."
      onResultSelect={(result) => {
        // Handle result selection
        navigate(result.navigationUrl);
      }}
    />
  );
}
```

### Command Palette
```tsx
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { CommandPalette } from '@/components/search';

function App() {
  const { isOpen, close } = useCommandPalette();
  
  return (
    <div>
      {/* Your app content */}
      <CommandPalette 
        isOpen={isOpen} 
        onClose={close} 
      />
    </div>
  );
}
```

## Testing

The components include comprehensive TypeScript types and follow existing patterns for:
- Unit testing with Jest and React Testing Library
- Integration testing with search API mocks
- Accessibility testing with keyboard navigation
- Performance testing for debouncing and caching

## Performance Considerations

- Debounced search input (300ms)
- React Query caching (2-5 minutes)
- Recent searches localStorage optimization
- Keyboard navigation virtualization for large result sets
- Lazy loading of navigation commands
- Optimized re-renders with useMemo and useCallback