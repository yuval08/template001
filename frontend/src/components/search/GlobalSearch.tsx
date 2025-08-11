import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, Command } from 'lucide-react';
import { cn } from '@/utils/cn';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { useSearch, useRecentSearches, SearchResult, RecentSearch } from '@/entities/search';
import { SearchResults } from './SearchResults';
import { useDebounce } from '@/hooks/useDebounce';

interface GlobalSearchProps {
  placeholder?: string;
  onResultSelect?: (result: SearchResult) => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  showCommandHint?: boolean;
}

/**
 * GlobalSearch component with debounced search and dropdown results
 * Integrates with the universal search API and manages recent searches
 */
export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  placeholder = 'Search everything...',
  onResultSelect,
  className,
  size = 'md',
  showCommandHint = false,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const popoverRef = useRef<HTMLDivElement>(null);

  // Debounce search term to avoid excessive API calls
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Search hook - only triggers when debounced term changes
  const {
    data: searchData,
    isLoading,
    error
  } = useSearch({
    searchTerm: debouncedSearchTerm,
    page: 1,
    pageSize: 20
  });

  // Recent searches management
  const { getRecentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load recent searches on component mount
  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, [getRecentSearches]);

  // Calculate total items for keyboard navigation
  const totalItems = React.useMemo(() => {
    if (!searchTerm && recentSearches.length > 0) {
      return recentSearches.length;
    }
    return searchData?.results?.length || 0;
  }, [searchTerm, recentSearches.length, searchData?.results?.length]);

  // Handle search input change
  const handleSearchChange = useCallback((value: string) => {
    setSearchTerm(value);
    setSelectedIndex(-1); // Reset selection
    setIsOpen(value.length > 0 || recentSearches.length > 0);
  }, [recentSearches.length]);

  // Handle result selection
  const handleResultSelect = useCallback((result: SearchResult) => {
    // Add to recent searches
    addRecentSearch(searchTerm, searchData?.totalCount || 0);
    setRecentSearches(getRecentSearches());
    
    // Close popover and clear input
    setIsOpen(false);
    setSearchTerm('');
    setSelectedIndex(-1);
    
    // Call parent handler
    onResultSelect?.(result);
    
    // Blur input
    inputRef.current?.blur();
  }, [searchTerm, searchData?.totalCount, addRecentSearch, getRecentSearches, onResultSelect]);

  // Handle recent search selection
  const handleRecentSearchSelect = useCallback((search: RecentSearch) => {
    setSearchTerm(search.query);
    setIsOpen(true);
    inputRef.current?.focus();
  }, []);

  // Handle clear recent searches
  const handleClearRecent = useCallback(() => {
    clearRecentSearches();
    setRecentSearches([]);
    if (!searchTerm) {
      setIsOpen(false);
    }
  }, [clearRecentSearches, searchTerm]);

  // Handle input focus
  const handleFocus = useCallback(() => {
    setIsOpen(searchTerm.length > 0 || recentSearches.length > 0);
  }, [searchTerm.length, recentSearches.length]);

  // Handle input blur with delay to allow clicks
  const handleBlur = useCallback(() => {
    setTimeout(() => {
      if (!popoverRef.current?.matches(':hover')) {
        setIsOpen(false);
        setSelectedIndex(-1);
      }
    }, 150);
  }, []);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (!isOpen) {
      if (event.key === 'Enter' || event.key === 'ArrowDown') {
        event.preventDefault();
        setIsOpen(true);
        return;
      }
    }

    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        setIsOpen(false);
        setSelectedIndex(-1);
        inputRef.current?.blur();
        break;

      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev < totalItems - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev => 
          prev > 0 ? prev - 1 : totalItems - 1
        );
        break;

      case 'Enter':
        event.preventDefault();
        if (selectedIndex >= 0) {
          // Handle selection of highlighted item
          if (!searchTerm && recentSearches.length > 0) {
            // Recent search selected
            const selectedSearch = recentSearches[selectedIndex];
            if (selectedSearch) {
              handleRecentSearchSelect(selectedSearch);
            }
          } else if (searchData?.results && searchData.results.length > 0) {
            // Search result selected
            const selectedResult = searchData.results[selectedIndex];
            if (selectedResult) {
              handleResultSelect(selectedResult);
            }
          }
        } else if (searchTerm.trim()) {
          // Perform search with current term
          if (searchData?.results && searchData.results.length > 0) {
            const firstResult = searchData.results[0];
            if (firstResult) {
              handleResultSelect(firstResult); // Select first result
            }
          }
        }
        break;

      case 'Tab':
        if (isOpen) {
          event.preventDefault();
          setIsOpen(false);
          setSelectedIndex(-1);
        }
        break;
    }
  }, [
    isOpen,
    totalItems,
    selectedIndex,
    searchTerm,
    recentSearches,
    searchData?.results,
    handleResultSelect,
    handleRecentSearchSelect
  ]);

  // Clear search
  const handleClear = useCallback(() => {
    setSearchTerm('');
    setSelectedIndex(-1);
    setIsOpen(recentSearches.length > 0);
    inputRef.current?.focus();
  }, [recentSearches.length]);

  // Size variants
  const sizeClasses = {
    sm: 'h-8 text-sm',
    md: 'h-10',
    lg: 'h-12 text-lg'
  };

  return (
    <div className={cn('relative', className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <div className="relative">
            <div className="absolute inset-y-0 left-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            
            <Input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => handleSearchChange(e.target.value)}
              onFocus={handleFocus}
              onBlur={handleBlur}
              onKeyDown={handleKeyDown}
              placeholder={placeholder}
              className={cn(
                'pl-10 pr-20 transition-all duration-200',
                'focus:ring-2 focus:ring-blue-500 focus:border-blue-500',
                'dark:bg-gray-800 dark:border-gray-700',
                sizeClasses[size]
              )}
              aria-label="Search"
              aria-expanded={isOpen}
              aria-haspopup="listbox"
              aria-autocomplete="list"
              role="combobox"
            />

            <div className="absolute inset-y-0 right-3 flex items-center gap-1">
              {searchTerm && (
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleClear}
                  className="h-auto p-1 text-gray-400 hover:text-gray-600"
                  aria-label="Clear search"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
              
              {showCommandHint && !searchTerm && (
                <div className="flex items-center gap-1 text-xs text-gray-400 bg-gray-100 dark:bg-gray-800 rounded px-2 py-1">
                  <Command className="h-3 w-3" />
                  <span>K</span>
                </div>
              )}
            </div>
          </div>
        </PopoverTrigger>

        <PopoverContent 
          ref={popoverRef}
          className="w-[var(--radix-popover-trigger-width)] max-w-2xl p-0"
          align="start"
          side="bottom"
          sideOffset={4}
        >
          <SearchResults
            results={searchData?.results || []}
            recentSearches={recentSearches}
            isLoading={isLoading}
            error={error?.message}
            searchTerm={debouncedSearchTerm}
            selectedIndex={selectedIndex}
            onResultSelect={handleResultSelect}
            onRecentSearchSelect={handleRecentSearchSelect}
            onClearRecent={handleClearRecent}
            showRecentSearches={true}
            className="max-h-96 overflow-y-auto"
          />
        </PopoverContent>
      </Popover>
    </div>
  );
};