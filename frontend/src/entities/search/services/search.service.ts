import { BaseApiService } from '@/shared/api';
import {
  SearchResponse,
  SearchSuggestionsResponse,
  EntityTypesResponse,
  SearchQueryParams,
  SearchSuggestionsParams
} from '../types';
import { SearchDtoMapper } from '../dtos';

/**
 * Search service handling all search-related API operations
 */
export class SearchService extends BaseApiService {
  private readonly searchPath = '/api/search';

  /**
   * Perform universal search across entities
   */
  async search(params: SearchQueryParams = {}): Promise<SearchResponse> {
    const queryParams = SearchDtoMapper.searchParamsToRequest(params);
    return this.get<SearchResponse>(this.searchPath, queryParams);
  }

  /**
   * Get search suggestions based on partial input
   */
  async getSuggestions(params: SearchSuggestionsParams = {}): Promise<SearchSuggestionsResponse> {
    const queryParams = SearchDtoMapper.suggestionsParamsToRequest(params);
    return this.get<SearchSuggestionsResponse>(`${this.searchPath}/suggestions`, queryParams);
  }

  /**
   * Get available entity types for search filtering
   */
  async getEntityTypes(): Promise<EntityTypesResponse> {
    return this.get<EntityTypesResponse>(`${this.searchPath}/entity-types`);
  }

  /**
   * Business logic methods
   */

  /**
   * Quick search with default parameters
   */
  async quickSearch(searchTerm: string): Promise<SearchResponse> {
    return this.search({
      searchTerm,
      page: 1,
      pageSize: 10
    });
  }

  /**
   * Get suggestions with default limit
   */
  async getQuickSuggestions(query: string): Promise<string[]> {
    if (!query || query.length < 2) {
      return [];
    }

    const response = await this.getSuggestions({
      query,
      limit: 5
    });
    
    return response.suggestions || [];
  }

  /**
   * Search with entity type filtering
   */
  async searchByEntityTypes(searchTerm: string, entityTypes: string[]): Promise<SearchResponse> {
    const parsedTypes = SearchDtoMapper.parseEntityTypes(entityTypes);
    
    return this.search({
      searchTerm,
      page: 1,
      pageSize: 20,
      entityTypes: parsedTypes
    });
  }
}