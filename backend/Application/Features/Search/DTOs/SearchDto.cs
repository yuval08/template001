namespace IntranetStarter.Application.Features.Search.DTOs;

public record SearchResponse(
    List<SearchResultDto> Results,
    int                   TotalCount,
    int                   PageNumber,
    int                   PageSize,
    int                   TotalPages,
    string?               SearchTerm
);

public record SearchResultDto(
    Guid         Id,
    string       Title,
    string       Description,
    SearchEntityType EntityType,
    string       NavigationUrl,
    double       RelevanceScore,
    DateTime     CreatedAt,
    DateTime?    UpdatedAt,
    SearchMetadata? Metadata
);

public record SearchMetadata(
    Dictionary<string, object> AdditionalData
);

public enum SearchEntityType
{
    Project = 1,
    User = 2,
    // Future entities can be added here
    Document = 3,
    Task = 4
}