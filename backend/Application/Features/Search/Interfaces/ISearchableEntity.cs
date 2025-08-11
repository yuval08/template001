using IntranetStarter.Application.Features.Search.DTOs;

namespace IntranetStarter.Application.Features.Search.Interfaces;

/// <summary>
/// Interface for entities that can be searched through the universal search
/// </summary>
public interface ISearchableEntity
{
    /// <summary>
    /// The entity type for search results
    /// </summary>
    SearchEntityType EntityType { get; }
    
    /// <summary>
    /// Primary search fields - these will be weighted higher in relevance scoring
    /// </summary>
    IEnumerable<string> GetPrimarySearchFields();
    
    /// <summary>
    /// Secondary search fields - these will be weighted lower in relevance scoring
    /// </summary>
    IEnumerable<string> GetSecondarySearchFields();
    
    /// <summary>
    /// Convert entity to search result DTO
    /// </summary>
    SearchResultDto ToSearchResult(double relevanceScore);
    
    /// <summary>
    /// Determine if the entity matches the search term
    /// </summary>
    bool MatchesSearchTerm(string searchTerm);
}