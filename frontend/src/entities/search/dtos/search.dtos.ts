import { SearchQueryParams, SearchSuggestionsParams, SearchEntityType } from '../types';

/**
 * DTO mappers for search operations
 */

export class SearchDtoMapper {
  /**
   * Map frontend search query parameters to API request format
   */
  static searchParamsToRequest(params: SearchQueryParams): Record<string, any> {
    const request: Record<string, any> = {};
    
    if (params.searchTerm !== undefined) {
      request.searchTerm = params.searchTerm;
    }
    if (params.page !== undefined) {
      request.page = params.page;
    }
    if (params.pageSize !== undefined) {
      request.pageSize = params.pageSize;
    }
    if (params.entityTypes && params.entityTypes.length > 0) {
      request.entityTypes = params.entityTypes.join(',');
    }
    
    return request;
  }

  /**
   * Map frontend suggestions parameters to API request format
   */
  static suggestionsParamsToRequest(params: SearchSuggestionsParams): Record<string, any> {
    const request: Record<string, any> = {};
    
    if (params.query !== undefined) {
      request.query = params.query;
    }
    if (params.limit !== undefined) {
      request.limit = params.limit;
    }
    
    return request;
  }

  /**
   * Parse entity types from string array
   */
  static parseEntityTypes(entityTypes: string[]): SearchEntityType[] {
    return entityTypes
      .map(type => {
        const enumValue = Object.values(SearchEntityType).find(
          value => value.toLowerCase() === type.toLowerCase()
        );
        return enumValue;
      })
      .filter(Boolean) as SearchEntityType[];
  }

  /**
   * Format entity types for display
   */
  static formatEntityTypeForDisplay(entityType: SearchEntityType): string {
    switch (entityType) {
      case SearchEntityType.Project:
        return 'Project';
      case SearchEntityType.User:
        return 'User';
      case SearchEntityType.Document:
        return 'Document';
      case SearchEntityType.Task:
        return 'Task';
      default:
        return entityType;
    }
  }

  /**
   * Get entity type icon
   */
  static getEntityTypeIcon(entityType: SearchEntityType): string {
    switch (entityType) {
      case SearchEntityType.Project:
        return 'folder';
      case SearchEntityType.User:
        return 'user';
      case SearchEntityType.Document:
        return 'file-text';
      case SearchEntityType.Task:
        return 'check-square';
      default:
        return 'help-circle';
    }
  }
}