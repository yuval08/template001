using IntranetStarter.Application.DTOs;
using IntranetStarter.Application.Mappers;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Queries;

public class GetProjectsQueryHandler(IUnitOfWork unitOfWork, ILogger<GetProjectsQueryHandler> logger) : IRequestHandler<GetProjectsQuery, ProjectsResponse> {
    public async Task<ProjectsResponse> Handle(GetProjectsQuery request, CancellationToken cancellationToken) {
        logger.LogInformation("Fetching projects - Page: {Page}, PageSize: {PageSize}, Search: {Search}", request.Page, request.PageSize, request.Search);

        var repository = unitOfWork.Repository<Project>();

        // Get all projects (in a real implementation, you'd want to implement pagination at the repository level)
        var allProjects = await repository.GetAllAsync(cancellationToken);

        // Apply search filter if provided
        if (!string.IsNullOrWhiteSpace(request.Search)) {
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
            .Select(p => p.MapToDto())
            .ToList();

        logger.LogInformation("Retrieved {Count} projects out of {TotalCount}", projects.Count, totalCount);

        return new ProjectsResponse(projects, totalCount, request.Page, request.PageSize, totalPages);
    }


    public class GetProjectQueryHandler(IUnitOfWork unitOfWork, ILogger<GetProjectQueryHandler> logger) : IRequestHandler<GetProjectQuery, ProjectDto?> {
        public async Task<ProjectDto?> Handle(GetProjectQuery request, CancellationToken cancellationToken) {
            logger.LogInformation("Fetching project with ID: {ProjectId}", request.Id);

            var project = await unitOfWork.Repository<Project>().GetByIdAsync(request.Id, cancellationToken);

            if (project == null) {
                logger.LogWarning("Project with ID {ProjectId} not found", request.Id);
                return null;
            }

            return project.MapToDto();
        }
    }
}