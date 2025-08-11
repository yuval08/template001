import { SearchResult, SearchQueryParams, SearchSuggestionsParams } from './search.types';

/**
 * API response types for search endpoints
 */

export interface SearchResponse {
  results: SearchResult[];
  totalCount: number;
  pageNumber: number;
  pageSize: number;
  totalPages: number;
  searchTerm?: string;
}

export interface SearchSuggestionsResponse {
  suggestions: string[];
}

export interface EntityTypeInfo {
  value: string;
  displayName: string;
  description: string;
}

export interface EntityTypesResponse {
  entityTypes: EntityTypeInfo[];
}

// Request types for API calls
export interface SearchRequest {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  entityTypes?: string; // Comma-separated string for API
}

export interface SearchSuggestionsRequest extends SearchSuggestionsParams {
  query?: string;
  limit?: number;
}