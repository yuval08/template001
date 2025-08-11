using IntranetStarter.Application.Features.Search.DTOs;
using IntranetStarter.Application.Features.Search.Interfaces;
using IntranetStarter.Application.Features.Search.Mappers;
using IntranetStarter.Domain.Entities;

namespace IntranetStarter.Application.Features.Search.Extensions;

/// <summary>
/// Extensions to make domain entities searchable without modifying the domain layer
/// </summary>
public static class SearchableEntityExtensions
{
    public static bool IsSearchableEntity(this object entity) =>
        entity is Project or User;

    public static ISearchableEntity AsSearchableEntity(this object entity) =>
        entity switch
        {
            Project project => new SearchableProject(project),
            User user => new SearchableUser(user),
            _ => throw new ArgumentException($"Entity type {entity.GetType().Name} is not searchable")
        };
}

internal class SearchableProject(Project project) : ISearchableEntity
{
    public SearchEntityType EntityType => SearchEntityType.Project;

    public IEnumerable<string> GetPrimarySearchFields()
    {
        yield return project.Name;
        if (!string.IsNullOrWhiteSpace(project.ClientName))
            yield return project.ClientName;
    }

    public IEnumerable<string> GetSecondarySearchFields()
    {
        yield return project.Description;
        if (!string.IsNullOrWhiteSpace(project.Tags))
            yield return project.Tags;
    }

    public SearchResultDto ToSearchResult(double relevanceScore) =>
        project.ToSearchResultDto(relevanceScore);

    public bool MatchesSearchTerm(string searchTerm)
    {
        var normalizedTerm = searchTerm.ToLowerInvariant();
        
        // Check primary fields
        foreach (var field in GetPrimarySearchFields())
        {
            if (!string.IsNullOrWhiteSpace(field) && 
                field.ToLowerInvariant().Contains(normalizedTerm))
                return true;
        }

        // Check secondary fields
        foreach (var field in GetSecondarySearchFields())
        {
            if (!string.IsNullOrWhiteSpace(field) && 
                field.ToLowerInvariant().Contains(normalizedTerm))
                return true;
        }

        return false;
    }
}

internal class SearchableUser(User user) : ISearchableEntity
{
    public SearchEntityType EntityType => SearchEntityType.User;

    public IEnumerable<string> GetPrimarySearchFields()
    {
        yield return user.FirstName;
        yield return user.LastName;
        yield return user.FullName;
        yield return user.Email;
    }

    public IEnumerable<string> GetSecondarySearchFields()
    {
        if (!string.IsNullOrWhiteSpace(user.JobTitle))
            yield return user.JobTitle;
        if (!string.IsNullOrWhiteSpace(user.Department))
            yield return user.Department;
    }

    public SearchResultDto ToSearchResult(double relevanceScore) =>
        user.ToSearchResultDto(relevanceScore);

    public bool MatchesSearchTerm(string searchTerm)
    {
        var normalizedTerm = searchTerm.ToLowerInvariant();
        
        // Check primary fields
        foreach (var field in GetPrimarySearchFields())
        {
            if (!string.IsNullOrWhiteSpace(field) && 
                field.ToLowerInvariant().Contains(normalizedTerm))
                return true;
        }

        // Check secondary fields
        foreach (var field in GetSecondarySearchFields())
        {
            if (!string.IsNullOrWhiteSpace(field) && 
                field.ToLowerInvariant().Contains(normalizedTerm))
                return true;
        }

        return false;
    }
}