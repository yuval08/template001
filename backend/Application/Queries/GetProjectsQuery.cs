using IntranetStarter.Application.DTOs;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Queries;

public record GetProjectsQuery(int Page = 1, int PageSize = 10, string? Search = null) : IRequest<ProjectsResponse>;

public record ProjectsResponse(
    List<ProjectDto> Projects,
    int TotalCount,
    int Page,
    int PageSize,
    int TotalPages
);

public class GetProjectsQueryHandler : IRequestHandler<GetProjectsQuery, ProjectsResponse>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<GetProjectsQueryHandler> _logger;

    public GetProjectsQueryHandler(
        IUnitOfWork unitOfWork,
        ILogger<GetProjectsQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ProjectsResponse> Handle(GetProjectsQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching projects - Page: {Page}, PageSize: {PageSize}, Search: {Search}", 
            request.Page, request.PageSize, request.Search);

        var repository = _unitOfWork.Repository<Project>();
        
        // Get all projects (in a real implementation, you'd want to implement pagination at the repository level)
        var allProjects = await repository.GetAllAsync(cancellationToken);
        
        // Apply search filter if provided
        if (!string.IsNullOrWhiteSpace(request.Search))
        {
            allProjects = allProjects.Where(p => 
                p.Name.Contains(request.Search, StringComparison.OrdinalIgnoreCase) ||
                p.Description.Contains(request.Search, StringComparison.OrdinalIgnoreCase));
        }

        var totalCount = allProjects.Count();
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        // Apply pagination
        var projects = allProjects
            .Skip((request.Page - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(MapToDto)
            .ToList();

        _logger.LogInformation("Retrieved {Count} projects out of {TotalCount}", projects.Count, totalCount);

        return new ProjectsResponse(projects, totalCount, request.Page, request.PageSize, totalPages);
    }

    private static ProjectDto MapToDto(Project project)
    {
        return new ProjectDto(
            project.Id,
            project.Name,
            project.Description,
            project.ImageUrl,
            project.StartDate,
            project.EndDate,
            project.Status,
            project.Budget,
            project.ClientName,
            project.Tags,
            project.Priority,
            project.Owner != null ? new UserDto(
                project.Owner.Id,
                project.Owner.Email,
                project.Owner.FirstName,
                project.Owner.LastName,
                project.Owner.Avatar,
                project.Owner.Role,
                project.Owner.Department,
                project.Owner.JobTitle,
                project.Owner.IsActive
            ) : null,
            project.TeamMembers?.Select(u => new UserDto(
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.Avatar,
                u.Role,
                u.Department,
                u.JobTitle,
                u.IsActive
            )).ToList() ?? new List<UserDto>(),
            project.CreatedAt,
            project.UpdatedAt
        );
    }
}

public record GetProjectQuery(Guid Id) : IRequest<ProjectDto?>;

public class GetProjectQueryHandler : IRequestHandler<GetProjectQuery, ProjectDto?>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<GetProjectQueryHandler> _logger;

    public GetProjectQueryHandler(
        IUnitOfWork unitOfWork,
        ILogger<GetProjectQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<ProjectDto?> Handle(GetProjectQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching project with ID: {ProjectId}", request.Id);

        var project = await _unitOfWork.Repository<Project>().GetByIdAsync(request.Id, cancellationToken);
        
        if (project == null)
        {
            _logger.LogWarning("Project with ID {ProjectId} not found", request.Id);
            return null;
        }

        return MapToDto(project);
    }

    private static ProjectDto MapToDto(Project project)
    {
        return new ProjectDto(
            project.Id,
            project.Name,
            project.Description,
            project.ImageUrl,
            project.StartDate,
            project.EndDate,
            project.Status,
            project.Budget,
            project.ClientName,
            project.Tags,
            project.Priority,
            project.Owner != null ? new UserDto(
                project.Owner.Id,
                project.Owner.Email,
                project.Owner.FirstName,
                project.Owner.LastName,
                project.Owner.Avatar,
                project.Owner.Role,
                project.Owner.Department,
                project.Owner.JobTitle,
                project.Owner.IsActive
            ) : null,
            project.TeamMembers?.Select(u => new UserDto(
                u.Id,
                u.Email,
                u.FirstName,
                u.LastName,
                u.Avatar,
                u.Role,
                u.Department,
                u.JobTitle,
                u.IsActive
            )).ToList() ?? new List<UserDto>(),
            project.CreatedAt,
            project.UpdatedAt
        );
    }
}