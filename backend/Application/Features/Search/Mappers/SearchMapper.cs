using IntranetStarter.Application.Features.Search.DTOs;
using IntranetStarter.Domain.Entities;

namespace IntranetStarter.Application.Features.Search.Mappers;

public static class SearchMapper
{
    public static SearchResultDto ToSearchResultDto(this Project project, double relevanceScore)
    {
        return new SearchResultDto(
            project.Id,
            project.Name,
            project.Description,
            SearchEntityType.Project,
            $"/projects/{project.Id}",
            relevanceScore,
            project.CreatedAt,
            project.UpdatedAt,
            new SearchMetadata(new Dictionary<string, object>
            {
                ["status"] = project.Status.ToString(),
                ["budget"] = project.Budget,
                ["clientName"] = project.ClientName ?? string.Empty,
                ["priority"] = project.Priority,
                ["startDate"] = project.StartDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                ["endDate"] = project.EndDate?.ToString("yyyy-MM-dd") ?? string.Empty,
                ["tags"] = project.Tags ?? string.Empty
            })
        );
    }

    public static SearchResultDto ToSearchResultDto(this User user, double relevanceScore)
    {
        return new SearchResultDto(
            user.Id,
            user.FullName,
            $"{user.JobTitle ?? "Employee"} in {user.Department ?? "Unknown Department"}",
            SearchEntityType.User,
            $"/users/{user.Id}",
            relevanceScore,
            user.CreatedAt,
            user.UpdatedAt,
            new SearchMetadata(new Dictionary<string, object>
            {
                ["email"] = user.Email,
                ["role"] = user.Role,
                ["department"] = user.Department ?? string.Empty,
                ["jobTitle"] = user.JobTitle ?? string.Empty,
                ["isActive"] = user.IsActive,
                ["lastLoginAt"] = user.LastLoginAt?.ToString("yyyy-MM-dd HH:mm:ss") ?? string.Empty
            })
        );
    }
}