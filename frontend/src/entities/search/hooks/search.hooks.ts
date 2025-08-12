import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { SearchQueryParams, SearchSuggestionsParams, RecentSearch } from '../types';
import { getSearchService } from '@/shared/services';
import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

/**
 * Query Keys for search-related queries
 */
export const searchQueryKeys = {
  search: ['search'] as const,
  suggestions: ['search', 'suggestions'] as const,
  entityTypes: ['search', 'entity-types'] as const,
  searchResults: (params: SearchQueryParams) => [...searchQueryKeys.search, 'results', params] as const,
  searchSuggestions: (params: SearchSuggestionsParams) => [...searchQueryKeys.suggestions, params] as const,
};

/**
 * Hook to perform universal search with caching and deduplication
 */
export const useSearch = (params: SearchQueryParams = {}) => {
  return useQuery({
    queryKey: searchQueryKeys.searchResults(params),
    queryFn: () => getSearchService().search(params),
    enabled: !!params.searchTerm && params.searchTerm.length >= 2,
    placeholderData: (previousData) => previousData,
    staleTime: 1000 * 60 * 2, // Cache for 2 minutes
    gcTime: 1000 * 60 * 5, // Keep in cache for 5 minutes
  });
};

/**
 * Hook to get search suggestions with debouncing handled by React Query
 */
export const useSearchSuggestions = (params: SearchSuggestionsParams = {}) => {
  return useQuery({
    queryKey: searchQueryKeys.searchSuggestions(params),
    queryFn: () => getSearchService().getSuggestions(params),
    enabled: !!params.query && params.query.length >= 2,
    staleTime: 1000 * 60, // Cache suggestions for 1 minute
    gcTime: 1000 * 60 * 3, // Keep in cache for 3 minutes
  });
};

/**
 * Hook to get available entity types
 */
export const useEntityTypes = () => {
  return useQuery({
    queryKey: searchQueryKeys.entityTypes,
    queryFn: () => getSearchService().getEntityTypes(),
    staleTime: 1000 * 60 * 30, // Cache for 30 minutes (rarely changes)
  });
};

/**
 * Hook for quick search functionality
 */
export const useQuickSearch = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (searchTerm: string) => getSearchService().quickSearch(searchTerm),
    onSuccess: (data, variables) => {
      // Cache the results for potential re-use
      queryClient.setQueryData(
        searchQueryKeys.searchResults({ searchTerm: variables, page: 1, pageSize: 10 }),
        data
      );
    },
  });
};

/**
 * Hook for managing recent searches with localStorage persistence
 */
export const useRecentSearches = () => {
  const RECENT_SEARCHES_KEY = 'recent-searches';
  const MAX_RECENT_SEARCHES = 10;

  const getRecentSearches = useCallback((): RecentSearch[] => {
    try {
      const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
      if (!stored) return [];
      
      const parsed = JSON.parse(stored);
      return parsed.map((search: any) => ({
        ...search,
        timestamp: new Date(search.timestamp)
      }));
    } catch (error) {
      console.warn('Failed to parse recent searches from localStorage:', error);
      return [];
    }
  }, []);

  const addRecentSearch = useCallback((query: string, resultsCount: number) => {
    if (!query.trim()) return;

    try {
      const existingSearches = getRecentSearches();
      
      // Remove existing search with same query
      const filtered = existingSearches.filter(search => 
        search.query.toLowerCase() !== query.toLowerCase()
      );

      // Add new search at the beginning
      const newSearch: RecentSearch = {
        id: `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        query: query.trim(),
        timestamp: new Date(),
        resultsCount
      };

      const updated = [newSearch, ...filtered].slice(0, MAX_RECENT_SEARCHES);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to save recent search to localStorage:', error);
    }
  }, [getRecentSearches]);

  const clearRecentSearches = useCallback(() => {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (error) {
      console.warn('Failed to clear recent searches from localStorage:', error);
    }
  }, []);

  const removeRecentSearch = useCallback((searchId: string) => {
    try {
      const existingSearches = getRecentSearches();
      const updated = existingSearches.filter(search => search.id !== searchId);
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
    } catch (error) {
      console.warn('Failed to remove recent search from localStorage:', error);
    }
  }, [getRecentSearches]);

  return useMemo(() => ({
    getRecentSearches,
    addRecentSearch,
    clearRecentSearches,
    removeRecentSearch,
  }), [getRecentSearches, addRecentSearch, clearRecentSearches, removeRecentSearch]);
};

/**
 * Hook for navigation commands registry
 */
export const useNavigationCommands = () => {
  const { t } = useTranslation('search');
  
  return useMemo(() => [
    {
      id: 'dashboard',
      title: t('navigation.dashboard.title'),
      description: t('navigation.dashboard.description'),
      navigationUrl: '/',
      category: 'pages' as const,
      keywords: t('navigation.dashboard.keywords', { returnObjects: true }) as string[],
      icon: 'home'
    },
    {
      id: 'projects',
      title: t('navigation.projects.title'),
      description: t('navigation.projects.description'),
      navigationUrl: '/projects',
      category: 'pages' as const,
      keywords: t('navigation.projects.keywords', { returnObjects: true }) as string[],
      icon: 'folder'
    },
    {
      id: 'users',
      title: t('navigation.users.title'),
      description: t('navigation.users.description'),
      navigationUrl: '/users',
      category: 'pages' as const,
      keywords: t('navigation.users.keywords', { returnObjects: true }) as string[],
      icon: 'users'
    },
    {
      id: 'reports',
      title: t('navigation.reports.title'),
      description: t('navigation.reports.description'),
      navigationUrl: '/reports',
      category: 'pages' as const,
      keywords: t('navigation.reports.keywords', { returnObjects: true }) as string[],
      icon: 'bar-chart'
    },
    {
      id: 'notifications',
      title: t('navigation.notifications.title'),
      description: t('navigation.notifications.description'),
      navigationUrl: '/notifications',
      category: 'pages' as const,
      keywords: t('navigation.notifications.keywords', { returnObjects: true }) as string[],
      icon: 'bell'
    }
  ], [t]);
};