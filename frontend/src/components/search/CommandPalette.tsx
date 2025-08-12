import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  Search, 
  Command as CommandIcon, 
  Hash,
  ArrowRight,
  Clock,
  Home,
  Users,
  Folder,
  BarChart,
  Bell,
  X
} from 'lucide-react';
import { cn } from '@/utils/cn';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import { 
  useSearch, 
  useRecentSearches, 
  useNavigationCommands,
  SearchResult, 
  RecentSearch, 
  NavigationCommand 
} from '@/entities/search';
import { SearchResults } from './SearchResults';
import { useDebounce } from '@/hooks/useDebounce';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onResultSelect?: (result: SearchResult) => void;
}

const navigationIcons = {
  home: Home,
  users: Users,
  folder: Folder,
  'bar-chart': BarChart,
  bell: Bell,
} as const;

/**
 * CommandPalette component - Full-screen modal search with keyboard shortcuts
 * Combines search results with navigation commands for quick access
 */
export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onResultSelect
}) => {
  const { t } = useTranslation(['search', 'common']);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [activeCategory, setActiveCategory] = useState<'all' | 'pages' | 'search' | 'recent'>('all');
  const inputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  // Debounce search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Search hook
  const {
    data: searchData,
    isLoading,
    error
  } = useSearch({
    searchTerm: debouncedSearchTerm,
    page: 1,
    pageSize: 10
  });

  // Navigation commands and recent searches
  const navigationCommands = useNavigationCommands();
  const { getRecentSearches, addRecentSearch, clearRecentSearches } = useRecentSearches();
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);

  // Load recent searches
  useEffect(() => {
    if (isOpen) {
      setRecentSearches(getRecentSearches());
      // Focus input when opened
      setTimeout(() => inputRef.current?.focus(), 100);
    } else {
      // Reset state when closed
      setSearchTerm('');
      setSelectedIndex(0);
      setActiveCategory('all');
    }
  }, [isOpen, getRecentSearches]);

  // Filter and organize items based on search term and category
  const organizedItems = React.useMemo(() => {
    const items: Array<{
      id: string;
      type: 'navigation' | 'search' | 'recent';
      data: NavigationCommand | SearchResult | RecentSearch;
      category: string;
    }> = [];

    // Add navigation commands if no search term or matching keywords
    if (!searchTerm || activeCategory === 'pages' || activeCategory === 'all') {
      const filteredCommands = searchTerm
        ? navigationCommands.filter(cmd =>
            cmd.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cmd.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
            cmd.keywords.some(keyword =>
              keyword.toLowerCase().includes(searchTerm.toLowerCase())
            )
          )
        : navigationCommands;

      filteredCommands.forEach(cmd => {
        items.push({
          id: cmd.id,
          type: 'navigation',
          data: cmd,
          category: t('search:categories.pages')
        });
      });
    }

    // Add search results if search term exists
    if (searchTerm && searchData?.results && (activeCategory === 'search' || activeCategory === 'all')) {
      searchData.results.forEach(result => {
        items.push({
          id: result.id,
          type: 'search',
          data: result,
          category: t('search:categories.search')
        });
      });
    }

    // Add recent searches if no search term
    if (!searchTerm && recentSearches.length > 0 && (activeCategory === 'recent' || activeCategory === 'all')) {
      recentSearches.slice(0, 5).forEach(search => {
        items.push({
          id: search.id,
          type: 'recent',
          data: search,
          category: t('search:categories.recent')
        });
      });
    }

    return items;
  }, [searchTerm, activeCategory, navigationCommands, searchData?.results, recentSearches]);

  // Handle item selection
  const handleItemSelect = useCallback((item: typeof organizedItems[0]) => {
    if (item.type === 'navigation') {
      const navItem = item.data as NavigationCommand;
      navigate(navItem.navigationUrl);
      onClose();
    } else if (item.type === 'search') {
      const searchResult = item.data as SearchResult;
      // Add to recent searches
      addRecentSearch(searchTerm, searchData?.totalCount || 0);
      onResultSelect?.(searchResult);
      onClose();
    } else if (item.type === 'recent') {
      const recentSearch = item.data as RecentSearch;
      setSearchTerm(recentSearch.query);
      setSelectedIndex(0);
    }
  }, [navigate, onClose, searchTerm, addRecentSearch, searchData?.totalCount, onResultSelect]);

  // Handle keyboard navigation
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    switch (event.key) {
      case 'Escape':
        event.preventDefault();
        onClose();
        break;

      case 'ArrowDown':
        event.preventDefault();
        setSelectedIndex(prev =>
          prev < organizedItems.length - 1 ? prev + 1 : 0
        );
        break;

      case 'ArrowUp':
        event.preventDefault();
        setSelectedIndex(prev =>
          prev > 0 ? prev - 1 : organizedItems.length - 1
        );
        break;

      case 'Enter':
        event.preventDefault();
        const selectedItem = organizedItems[selectedIndex];
        if (selectedItem) {
          handleItemSelect(selectedItem);
        }
        break;

      case 'Tab':
        event.preventDefault();
        // Cycle through categories
        const categories: Array<typeof activeCategory> = ['all', 'pages', 'search', 'recent'];
        const currentIndex = categories.indexOf(activeCategory);
        const nextIndex = (currentIndex + 1) % categories.length;
        const nextCategory = categories[nextIndex];
        if (nextCategory) {
          setActiveCategory(nextCategory);
        }
        setSelectedIndex(0);
        break;
    }
  }, [onClose, organizedItems, selectedIndex, handleItemSelect, activeCategory]);

  // Render individual command item
  const renderItem = (item: typeof organizedItems[0], index: number) => {
    const isSelected = index === selectedIndex;

    if (item.type === 'navigation') {
      const navItem = item.data as NavigationCommand;
      const IconComponent = navigationIcons[navItem.icon as keyof typeof navigationIcons] || Hash;

      return (
        <div
          key={item.id}
          role="option"
          aria-selected={isSelected}
          onClick={() => handleItemSelect(item)}
          className={cn(
            'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors rounded-md mx-2',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            isSelected && 'bg-blue-50 dark:bg-blue-900/20'
          )}
        >
          <IconComponent className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
              {navItem.title}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {navItem.description}
            </div>
          </div>
          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>
      );
    }

    if (item.type === 'search') {
      const searchResult = item.data as SearchResult;
      return (
        <div
          key={item.id}
          role="option"
          aria-selected={isSelected}
          onClick={() => handleItemSelect(item)}
          className={cn(
            'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors rounded-md mx-2',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            isSelected && 'bg-blue-50 dark:bg-blue-900/20'
          )}
        >
          <Search className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {searchResult.title}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 truncate">
              {searchResult.description}
            </div>
          </div>
          <Badge variant="secondary" className="text-xs">
            {t(`search:entity_types.${searchResult.entityType.toLowerCase()}`)}
          </Badge>
          <ArrowRight className="h-4 w-4 text-gray-400 flex-shrink-0" />
        </div>
      );
    }

    if (item.type === 'recent') {
      const recentSearch = item.data as RecentSearch;
      return (
        <div
          key={item.id}
          role="option"
          aria-selected={isSelected}
          onClick={() => handleItemSelect(item)}
          className={cn(
            'flex items-center gap-3 px-4 py-3 cursor-pointer transition-colors rounded-md mx-2',
            'hover:bg-gray-50 dark:hover:bg-gray-800',
            isSelected && 'bg-blue-50 dark:bg-blue-900/20'
          )}
        >
          <Clock className="h-4 w-4 text-gray-500 dark:text-gray-400 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <div className="text-sm text-gray-900 dark:text-gray-100 truncate">
              {recentSearch.query}
            </div>
            {recentSearch.resultsCount > 0 && (
              <div className="text-xs text-gray-500 dark:text-gray-400">
                {t('search:results_count', { count: recentSearch.resultsCount })}
              </div>
            )}
          </div>
        </div>
      );
    }

    return null;
  };

  // Group items by category
  const groupedItems = React.useMemo(() => {
    const groups: Record<string, typeof organizedItems> = {};
    organizedItems.forEach(item => {
      if (!groups[item.category]) {
        groups[item.category] = [];
      }
      groups[item.category]?.push(item);
    });
    return groups;
  }, [organizedItems]);

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className="max-w-2xl p-0 gap-0 h-[600px] overflow-hidden [&>button]:hidden"
        onKeyDown={handleKeyDown}
      >
        {/* Header */}
        <DialogHeader className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <DialogTitle className="sr-only">
            {t('search:commands.command_palette')}
          </DialogTitle>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400">
              <CommandIcon className="h-4 w-4" />
              <span className="text-sm font-medium">{t('search:commands.command_palette')}</span>
            </div>
            <div className="flex-1" />
            <button
              onClick={onClose}
              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        </DialogHeader>

        {/* Search Input */}
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              ref={inputRef}
              type="text"
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setSelectedIndex(0);
              }}
              placeholder={t('search:placeholder_command')}
              className="pl-10 border-0 shadow-none focus:ring-0 text-base"
              autoFocus
            />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden">
          {isLoading ? (
            <div className="flex items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <div className="flex items-center gap-2">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-blue-500"></div>
                <span className="text-sm">{t('search:searching')}</span>
              </div>
            </div>
          ) : organizedItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500 dark:text-gray-400">
              <Search className="h-8 w-8 mb-2 text-gray-300 dark:text-gray-600" />
              <p className="text-sm">
                {searchTerm ? t('search:no_results') : t('search:start_typing_command')}
              </p>
            </div>
          ) : (
            <div className="overflow-y-auto h-full">
              {Object.entries(groupedItems).map(([category, items], groupIndex) => (
                <div key={category}>
                  {/* Category Header */}
                  <div className="px-6 py-2 text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider bg-gray-50 dark:bg-gray-800/50">
                    {category}
                  </div>

                  {/* Category Items */}
                  <div className="py-2">
                    {items.map((item, index) => {
                      const globalIndex = organizedItems.indexOf(item);
                      return renderItem(item, globalIndex);
                    })}
                  </div>

                  {/* Separator */}
                  {groupIndex < Object.keys(groupedItems).length - 1 && (
                    <Separator className="my-2" />
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer - Hidden on mobile */}
        <div className="hidden sm:block px-6 py-3 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
          <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">↑↓</kbd>
                <span>{t('search:commands.navigate')}</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">↵</kbd>
                <span>{t('search:commands.select')}</span>
              </div>
              <div className="flex items-center gap-1">
                <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Tab</kbd>
                <span>{t('search:commands.filter')}</span>
              </div>
            </div>
            <div className="flex items-center gap-1">
              <kbd className="px-1.5 py-0.5 text-xs bg-white dark:bg-gray-700 border border-gray-300 dark:border-gray-600 rounded">Esc</kbd>
              <span>{t('search:commands.close')}</span>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};