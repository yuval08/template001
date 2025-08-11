import React, { useMemo } from 'react';
import { Search, AlertCircle, Loader2 } from 'lucide-react';
import { cn } from '@/utils/cn';
import { SearchResult, SearchEntityType, RecentSearch } from '@/entities/search';
import { SearchItem } from './SearchItem';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

interface SearchResultsProps {
  results?: SearchResult[];
  recentSearches?: RecentSearch[];
  isLoading?: boolean;
  error?: string | null;
  searchTerm?: string;
  selectedIndex?: number;
  onResultSelect?: (result: SearchResult) => void;
  onRecentSearchSelect?: (search: RecentSearch) => void;
  onClearRecent?: () => void;
  showRecentSearches?: boolean;
  className?: string;
}

/**
 * SearchResults component for displaying search results and recent searches
 * Supports keyboard navigation and follows existing UI patterns
 */
export const SearchResults: React.FC<SearchResultsProps> = ({
  results = [],
  recentSearches = [],
  isLoading = false,
  error,
  searchTerm,
  selectedIndex = -1,
  onResultSelect,
  onRecentSearchSelect,
  onClearRecent,
  showRecentSearches = true,
  className
}) => {
  // Group results by entity type for better organization
  const groupedResults = useMemo(() => {
    const groups: Record<SearchEntityType, SearchResult[]> = {
      [SearchEntityType.Project]: [],
      [SearchEntityType.User]: [],
      [SearchEntityType.Document]: [],
      [SearchEntityType.Task]: []
    };

    results.forEach(result => {
      if (groups[result.entityType]) {
        groups[result.entityType].push(result);
      }
    });

    // Return only groups that have results
    return Object.entries(groups)
      .filter(([_, items]) => items.length > 0)
      .map(([type, items]) => ({
        type: type as SearchEntityType,
        items: items.sort((a, b) => b.relevanceScore - a.relevanceScore) // Sort by relevance
      }));
  }, [results]);

  // Calculate total items for keyboard navigation
  const totalItems = useMemo(() => {
    let count = 0;
    if (showRecentSearches && !searchTerm && recentSearches.length > 0) {
      count += recentSearches.length;
    }
    if (results.length > 0) {
      count += results.length;
    }
    return count;
  }, [results.length, recentSearches.length, searchTerm, showRecentSearches]);

  const handleResultClick = (result: SearchResult) => {
    onResultSelect?.(result);
  };

  const handleRecentSearchClick = (search: RecentSearch) => {
    onRecentSearchSelect?.(search);
  };

  // Loading state
  if (isLoading) {
    return (
      <div className={cn(
        'flex items-center justify-center gap-2 p-8 text-gray-500 dark:text-gray-400',
        className
      )}>
        <Loader2 className="h-4 w-4 animate-spin" />
        <span className="text-sm">Searching...</span>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className={cn(
        'flex items-center gap-2 p-4 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 rounded-md',
        className
      )}>
        <AlertCircle className="h-4 w-4 flex-shrink-0" />
        <span className="text-sm">{error}</span>
      </div>
    );
  }

  // Show recent searches when no search term
  if (!searchTerm && showRecentSearches && recentSearches.length > 0) {
    return (
      <div className={cn('space-y-2', className)}>
        <div className="flex items-center justify-between px-3 py-2">
          <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
            Recent Searches
          </h3>
          {recentSearches.length > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearRecent}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-300 h-auto p-1"
            >
              Clear
            </Button>
          )}
        </div>
        
        <div className="space-y-1">
          {recentSearches.map((search, index) => (
            <div
              key={search.id}
              role="option"
              aria-selected={index === selectedIndex}
              tabIndex={-1}
              onClick={() => handleRecentSearchClick(search)}
              className={cn(
                'flex items-center gap-3 px-3 py-2 rounded-md cursor-pointer transition-colors',
                'hover:bg-gray-50 dark:hover:bg-gray-800',
                'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
                index === selectedIndex && 'bg-blue-50 dark:bg-blue-900/20'
              )}
            >
              <Search className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <span className="text-sm text-gray-900 dark:text-gray-100 truncate">
                  {search.query}
                </span>
                {search.resultsCount > 0 && (
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">
                    {search.resultsCount} results
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // No results state
  if (searchTerm && results.length === 0) {
    return (
      <div className={cn(
        'flex flex-col items-center gap-3 p-8 text-gray-500 dark:text-gray-400',
        className
      )}>
        <Search className="h-8 w-8 text-gray-300 dark:text-gray-600" />
        <div className="text-center">
          <p className="text-sm font-medium">No results found</p>
          <p className="text-xs text-gray-400 mt-1">
            Try adjusting your search or browse recent searches
          </p>
        </div>
      </div>
    );
  }

  // Show search results grouped by entity type
  if (results.length > 0) {
    let itemIndex = 0;
    
    return (
      <div className={cn('space-y-4', className)}>
        {groupedResults.map(({ type, items }, groupIndex) => (
          <div key={type} className="space-y-2">
            {/* Group Header */}
            <div className="flex items-center gap-2 px-3 py-1">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                {type}
              </h3>
              <Badge variant="outline" className="text-xs">
                {items.length}
              </Badge>
            </div>

            {/* Group Items */}
            <div className="space-y-1">
              {items.map((result, index) => {
                const currentIndex = itemIndex++;
                return (
                  <SearchItem
                    key={result.id}
                    result={result}
                    isSelected={currentIndex === selectedIndex}
                    onSelect={() => handleResultClick(result)}
                  />
                );
              })}
            </div>

            {/* Separator between groups (except last) */}
            {groupIndex < groupedResults.length - 1 && (
              <Separator className="my-2" />
            )}
          </div>
        ))}

        {/* Results summary */}
        {results.length > 0 && (
          <div className="px-3 py-2 text-xs text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            Showing {results.length} result{results.length !== 1 ? 's' : ''} 
            {searchTerm && (
              <span> for "{searchTerm}"</span>
            )}
          </div>
        )}
      </div>
    );
  }

  // Empty state
  return (
    <div className={cn(
      'flex flex-col items-center gap-3 p-8 text-gray-500 dark:text-gray-400',
      className
    )}>
      <Search className="h-8 w-8 text-gray-300 dark:text-gray-600" />
      <div className="text-center">
        <p className="text-sm">Start typing to search</p>
        <p className="text-xs text-gray-400 mt-1">
          Search across projects, users, documents, and tasks
        </p>
      </div>
    </div>
  );
};