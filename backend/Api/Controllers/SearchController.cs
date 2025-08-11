using IntranetStarter.Application.Features.Search.DTOs;
using IntranetStarter.Application.Features.Search.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IntranetStarter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class SearchController(IMediator mediator, ILogger<SearchController> logger) : ControllerBase
{
    /// <summary>
    /// Universal search across multiple entity types
    /// </summary>
    /// <param name="searchTerm">Search term to query across entities</param>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <param name="entityTypes">Comma-separated list of entity types to search (Project, User). If not specified, searches all types.</param>
    /// <returns>Paginated search results with relevance scoring</returns>
    [HttpGet]
    public async Task<ActionResult<SearchResponse>> Search(
        [FromQuery] string? searchTerm = null,
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 10,
        [FromQuery] string? entityTypes = null)
    {
        try
        {
            // Parse entity types if provided
            IList<SearchEntityType>? parsedEntityTypes = null;
            if (!string.IsNullOrWhiteSpace(entityTypes))
            {
                var typeNames = entityTypes.Split(',', StringSplitOptions.RemoveEmptyEntries);
                parsedEntityTypes = new List<SearchEntityType>();
                
                foreach (var typeName in typeNames)
                {
                    if (Enum.TryParse<SearchEntityType>(typeName.Trim(), ignoreCase: true, out var entityType))
                    {
                        parsedEntityTypes.Add(entityType);
                    }
                    else
                    {
                        logger.LogWarning("Invalid entity type specified: {EntityType}", typeName);
                        return BadRequest($"Invalid entity type: {typeName}. Valid types are: {string.Join(", ", Enum.GetNames<SearchEntityType>())}");
                    }
                }
            }

            var query = new GetUniversalSearchQuery(searchTerm, page, pageSize, parsedEntityTypes);
            var result = await mediator.Send(query);

            return Ok(result);
        }
        catch (ArgumentException ex)
        {
            logger.LogWarning(ex, "Invalid argument in search request");
            return BadRequest(ex.Message);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error performing universal search with term: {SearchTerm}", searchTerm);
            return StatusCode(500, "An error occurred while performing the search");
        }
    }

    /// <summary>
    /// Get search suggestions based on partial input
    /// </summary>
    /// <param name="query">Partial search query</param>
    /// <param name="limit">Maximum number of suggestions (default: 5, max: 20)</param>
    /// <returns>List of search suggestions</returns>
    [HttpGet("suggestions")]
    public async Task<ActionResult<IList<string>>> GetSuggestions(
        [FromQuery] string? query = null,
        [FromQuery] int limit = 5)
    {
        try
        {
            if (string.IsNullOrWhiteSpace(query) || query.Length < 2)
            {
                return Ok(new List<string>());
            }

            if (limit > 20) limit = 20;
            if (limit < 1) limit = 1;

            // For now, return a simple implementation
            // In a real application, you might want to implement a more sophisticated suggestion system
            // using a dedicated search service like Elasticsearch or implement a suggestion cache
            var suggestions = new List<string>();

            // This is a placeholder implementation
            // You could enhance this by:
            // 1. Maintaining a suggestion cache based on popular searches
            // 2. Using autocomplete based on entity names
            // 3. Implementing fuzzy matching for typos
            
            logger.LogInformation("Search suggestions requested for query: {Query}, limit: {Limit}", query, limit);

            return Ok(suggestions);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error getting search suggestions for query: {Query}", query);
            return StatusCode(500, "An error occurred while getting search suggestions");
        }
    }

    /// <summary>
    /// Get available entity types for search
    /// </summary>
    /// <returns>List of searchable entity types with descriptions</returns>
    [HttpGet("entity-types")]
    public ActionResult<IList<object>> GetEntityTypes()
    {
        try
        {
            var entityTypes = Enum.GetValues<SearchEntityType>()
                .Select(et => new
                {
                    Value = et.ToString(),
                    DisplayName = et.ToString(),
                    Description = GetEntityTypeDescription(et)
                })
                .ToList();

            return Ok(entityTypes);
        }
        catch (Exception ex)
        {
            logger.LogError(ex, "Error retrieving entity types");
            return StatusCode(500, "An error occurred while retrieving entity types");
        }
    }

    private static string GetEntityTypeDescription(SearchEntityType entityType)
    {
        return entityType switch
        {
            SearchEntityType.Project => "Projects and project-related information",
            SearchEntityType.User => "User profiles and team member information",
            SearchEntityType.Document => "Documents and files",
            SearchEntityType.Task => "Tasks and work items",
            _ => "Unknown entity type"
        };
    }
}