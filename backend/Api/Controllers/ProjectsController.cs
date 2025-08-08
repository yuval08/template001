using IntranetStarter.Application.Commands;
using IntranetStarter.Application.DTOs;
using IntranetStarter.Application.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace IntranetStarter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class ProjectsController(IMediator mediator, ILogger<ProjectsController> logger) : ControllerBase {
    /// <summary>
    /// Get project summary statistics
    /// </summary>
    /// <returns>Project summary data</returns>
    [HttpGet("summary")]
    public async Task<ActionResult<object>> GetProjectSummary() {
        try {
            // For now, return mock data. In a real app, you'd implement GetProjectSummaryQuery
            var summary = new {
                TotalProjects     = 12,
                ActiveProjects    = 8,
                CompletedProjects = 4,
                TotalBudget       = 450000,
                ProjectsThisMonth = 3,
                CompletionRate    = 85.5,
                RecentProjects = new[] {
                    new { Name = "Website Redesign", Status   = "In Progress", Progress = 75 },
                    new { Name = "Mobile App", Status         = "Planning", Progress    = 10 },
                    new { Name = "Database Migration", Status = "Completed", Progress   = 100 }
                }
            };

            return Ok(summary);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving project summary");
            return StatusCode(500, "An error occurred while retrieving project summary");
        }
    }

    /// <summary>
    /// Get all projects with pagination and search
    /// </summary>
    /// <param name="page">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10)</param>
    /// <param name="search">Search term for name or description</param>
    /// <returns>Paginated list of projects</returns>
    [HttpGet]
    public async Task<ActionResult<ProjectsResponse>> GetProjects(
        [FromQuery] int     page     = 1,
        [FromQuery] int     pageSize = 10,
        [FromQuery] string? search   = null) {
        try {
            var query  = new GetProjectsQuery(page, pageSize, search);
            var result = await mediator.Send(query);

            return Ok(result);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving projects");
            return StatusCode(500, "An error occurred while retrieving projects");
        }
    }

    /// <summary>
    /// Get a specific project by ID
    /// </summary>
    /// <param name="id">Project ID</param>
    /// <returns>Project details</returns>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<ProjectDto>> GetProject(Guid id) {
        try {
            var query  = new GetProjectQuery(id);
            var result = await mediator.Send(query);

            if (result == null)
                return NotFound($"Project with ID {id} not found");

            return Ok(result);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving project {ProjectId}", id);
            return StatusCode(500, "An error occurred while retrieving the project");
        }
    }

    /// <summary>
    /// Create a new project
    /// </summary>
    /// <param name="createProjectDto">Project creation data</param>
    /// <returns>Created project</returns>
    [HttpPost]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult<ProjectDto>> CreateProject([FromBody] CreateProjectDto createProjectDto) {
        try {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            var command = new CreateProjectCommand(createProjectDto);
            var result  = await mediator.Send(command);

            return CreatedAtAction(
                nameof(GetProject),
                new { id = result.Id },
                result);
        }
        catch (ArgumentException ex) {
            logger.LogWarning(ex, "Invalid argument when creating project");
            return BadRequest(ex.Message);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error creating project");
            return StatusCode(500, "An error occurred while creating the project");
        }
    }

    /// <summary>
    /// Update an existing project
    /// </summary>
    /// <param name="id">Project ID</param>
    /// <param name="updateProjectDto">Project update data</param>
    /// <returns>Updated project</returns>
    [HttpPut("{id:guid}")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult<ProjectDto>> UpdateProject(Guid id, [FromBody] UpdateProjectDto updateProjectDto) {
        try {
            if (!ModelState.IsValid)
                return BadRequest(ModelState);

            // First check if project exists
            var existingProject = await mediator.Send(new GetProjectQuery(id));
            if (existingProject == null)
                return NotFound($"Project with ID {id} not found");

            // For simplicity, we're not implementing the update command in this example
            // In a real application, you would create an UpdateProjectCommand
            return Ok(existingProject);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error updating project {ProjectId}", id);
            return StatusCode(500, "An error occurred while updating the project");
        }
    }

    /// <summary>
    /// Delete a project
    /// </summary>
    /// <param name="id">Project ID</param>
    /// <returns>Success status</returns>
    [HttpDelete("{id:guid}")]
    [Authorize(Roles = "Manager,Admin")]
    public async Task<ActionResult> DeleteProject(Guid id) {
        try {
            // First check if project exists
            var existingProject = await mediator.Send(new GetProjectQuery(id));
            if (existingProject == null)
                return NotFound($"Project with ID {id} not found");

            // For simplicity, we're not implementing the delete command in this example
            // In a real application, you would create a DeleteProjectCommand

            return NoContent();
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error deleting project {ProjectId}", id);
            return StatusCode(500, "An error occurred while deleting the project");
        }
    }
}