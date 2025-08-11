/**
 * Search entity types for universal search functionality
 */

export interface SearchResult {
  id: string;
  title: string;
  description: string;
  entityType: SearchEntityType;
  navigationUrl: string;
  relevanceScore: number;
  createdAt: string;
  updatedAt?: string;
  metadata?: SearchMetadata;
}

export interface SearchMetadata {
  additionalData: Record<string, any>;
}

export enum SearchEntityType {
  Project = 'Project',
  User = 'User',
  Document = 'Document',
  Task = 'Task'
}

export interface SearchQueryParams {
  searchTerm?: string;
  page?: number;
  pageSize?: number;
  entityTypes?: SearchEntityType[];
}

export interface SearchSuggestionsParams {
  query?: string;
  limit?: number;
}

export interface SearchFilters {
  entityTypes?: SearchEntityType[];
}

export interface RecentSearch {
  id: string;
  query: string;
  timestamp: Date;
  resultsCount: number;
}

export interface NavigationCommand {
  id: string;
  title: string;
  description: string;
  navigationUrl: string;
  category: 'pages' | 'actions';
  keywords: string[];
  icon?: string;
}