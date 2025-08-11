using IntranetStarter.Application.Features.Search.DTOs;
using IntranetStarter.Application.Features.Search.Extensions;
using IntranetStarter.Application.Features.Search.Interfaces;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Features.Search.Queries;

public record GetUniversalSearchQuery(
    string? SearchTerm = null,
    int     Page       = 1,
    int     PageSize   = 10,
    IList<SearchEntityType>? EntityTypes = null
) : IRequest<SearchResponse>;

public class GetUniversalSearchQueryHandler(
    IUnitOfWork unitOfWork,
    ILogger<GetUniversalSearchQueryHandler> logger
) : IRequestHandler<GetUniversalSearchQuery, SearchResponse>
{
    public async Task<SearchResponse> Handle(GetUniversalSearchQuery request, CancellationToken cancellationToken)
    {
        logger.LogInformation(
            "Processing universal search - SearchTerm: {SearchTerm}, Page: {Page}, PageSize: {PageSize}, EntityTypes: {EntityTypes}",
            request.SearchTerm, request.Page, request.PageSize, 
            request.EntityTypes != null ? string.Join(",", request.EntityTypes) : "All"
        );

        if (string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            return new SearchResponse(
                new List<SearchResultDto>(),
                0,
                request.Page,
                request.PageSize,
                0,
                request.SearchTerm
            );
        }

        var searchResults = new List<SearchResultDto>();

        // Determine which entity types to search
        var entityTypesToSearch = request.EntityTypes?.ToList() ?? 
                                  Enum.GetValues<SearchEntityType>().ToList();

        // Search Projects
        if (entityTypesToSearch.Contains(SearchEntityType.Project))
        {
            var projectResults = await SearchProjectsAsync(request.SearchTerm, cancellationToken);
            searchResults.AddRange(projectResults);
        }

        // Search Users
        if (entityTypesToSearch.Contains(SearchEntityType.User))
        {
            var userResults = await SearchUsersAsync(request.SearchTerm, cancellationToken);
            searchResults.AddRange(userResults);
        }

        // Sort by relevance score (highest first)
        searchResults = searchResults
            .OrderByDescending(r => r.RelevanceScore)
            .ToList();

        var totalCount = searchResults.Count;
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        // Apply pagination
        var paginatedResults = searchResults
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .ToList();

        logger.LogInformation(
            "Universal search completed - Found {TotalCount} results, returning {PageCount} for page {Page}",
            totalCount, paginatedResults.Count, request.Page
        );

        return new SearchResponse(
            paginatedResults,
            totalCount,
            request.Page,
            request.PageSize,
            totalPages,
            request.SearchTerm
        );
    }

    private async Task<List<SearchResultDto>> SearchProjectsAsync(string searchTerm, CancellationToken cancellationToken)
    {
        var projects = await unitOfWork.Repository<Project>().GetAllAsync(cancellationToken);
        var results = new List<SearchResultDto>();

        foreach (var project in projects)
        {
            var searchableProject = project.AsSearchableEntity();
            if (searchableProject.MatchesSearchTerm(searchTerm))
            {
                var relevanceScore = CalculateRelevanceScore(searchTerm, searchableProject);
                results.Add(searchableProject.ToSearchResult(relevanceScore));
            }
        }

        return results;
    }

    private async Task<List<SearchResultDto>> SearchUsersAsync(string searchTerm, CancellationToken cancellationToken)
    {
        var users = await unitOfWork.Repository<User>().GetAllAsync(cancellationToken);
        var results = new List<SearchResultDto>();

        // Only search active users
        foreach (var user in users.Where(u => u.IsActive))
        {
            var searchableUser = user.AsSearchableEntity();
            if (searchableUser.MatchesSearchTerm(searchTerm))
            {
                var relevanceScore = CalculateRelevanceScore(searchTerm, searchableUser);
                results.Add(searchableUser.ToSearchResult(relevanceScore));
            }
        }

        return results;
    }

    private static double CalculateRelevanceScore(string searchTerm, ISearchableEntity entity)
    {
        var score = 0.0;
        var normalizedSearchTerm = searchTerm.ToLowerInvariant();

        // Check primary fields (higher weight)
        foreach (var field in entity.GetPrimarySearchFields())
        {
            if (string.IsNullOrWhiteSpace(field)) continue;
            
            var normalizedField = field.ToLowerInvariant();
            
            // Exact match gets highest score
            if (normalizedField.Equals(normalizedSearchTerm))
            {
                score += 100.0;
            }
            // Starts with gets high score
            else if (normalizedField.StartsWith(normalizedSearchTerm))
            {
                score += 75.0;
            }
            // Contains gets medium score
            else if (normalizedField.Contains(normalizedSearchTerm))
            {
                score += 50.0;
            }
        }

        // Check secondary fields (lower weight)
        foreach (var field in entity.GetSecondarySearchFields())
        {
            if (string.IsNullOrWhiteSpace(field)) continue;
            
            var normalizedField = field.ToLowerInvariant();
            
            // Exact match
            if (normalizedField.Equals(normalizedSearchTerm))
            {
                score += 50.0;
            }
            // Starts with
            else if (normalizedField.StartsWith(normalizedSearchTerm))
            {
                score += 25.0;
            }
            // Contains
            else if (normalizedField.Contains(normalizedSearchTerm))
            {
                score += 10.0;
            }
        }

        return score;
    }
}