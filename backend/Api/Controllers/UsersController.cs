using IntranetStarter.Application.Features.Invitations.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System.Security.Claims;
using IntranetStarter.Application.Features.Invitations.Commands;
using IntranetStarter.Application.Features.Invitations.DTOs;
using IntranetStarter.Application.Features.Users.Commands;
using IntranetStarter.Application.Features.Users.DTOs;
using IntranetStarter.Application.Features.Users.Queries;

namespace IntranetStarter.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize]
public class UsersController(IMediator mediator, ILogger<UsersController> logger) : ControllerBase {
    /// <summary>
    /// Get all users with pagination, filtering, and sorting (Admin only)
    /// </summary>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <param name="searchTerm">Search term for email, name, department, or job title</param>
    /// <param name="roleFilter">Filter by specific role</param>
    /// <param name="isActiveFilter">Filter by active status</param>
    /// <param name="sortBy">Field to sort by (email, firstname, lastname, fullname, role, jobtitle, department, status, createdat)</param>
    /// <param name="sortDescending">Sort in descending order (default: false)</param>
    /// <param name="showInactive">Include inactive users in results (default: false)</param>
    /// <returns>Paginated list of users</returns>
    [HttpGet]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<UsersResponse>> GetUsers(
        [FromQuery] int     pageNumber     = 1,
        [FromQuery] int     pageSize       = 10,
        [FromQuery] string? searchTerm     = null,
        [FromQuery] string? roleFilter     = null,
        [FromQuery] bool?   isActiveFilter = null,
        [FromQuery] string? sortBy         = null,
        [FromQuery] bool    sortDescending = false,
        [FromQuery] bool    showInactive   = false) {
        try {
            // Validate pagination parameters
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize     = 10;
            if (pageSize > 100) pageSize   = 100;

            string? currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            logger.LogInformation(
                "Admin user {Email} requesting users list - Page: {PageNumber}, PageSize: {PageSize}, SearchTerm: {SearchTerm}, RoleFilter: {RoleFilter}, IsActiveFilter: {IsActiveFilter}, SortBy: {SortBy}, SortDescending: {SortDescending}, ShowInactive: {ShowInactive}",
                currentUserEmail, pageNumber, pageSize, searchTerm, roleFilter, isActiveFilter, sortBy, sortDescending, showInactive);

            var query  = new GetUsersQuery(pageNumber, pageSize, searchTerm, roleFilter, isActiveFilter, sortBy, sortDescending, showInactive);
            var result = await mediator.Send(query);

            logger.LogInformation("Successfully retrieved {UserCount} users out of {TotalCount} for admin user {Email}",
                result.Data.Count, result.TotalCount, currentUserEmail);

            return Ok(result);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving users list");
            return StatusCode(500, "An error occurred while retrieving users");
        }
    }

    /// <summary>
    /// Get user details by ID
    /// Users can view their own profile, admins can view any profile
    /// </summary>
    /// <param name="id">User ID</param>
    /// <returns>User details</returns>
    [HttpGet("{id:guid}")]
    public async Task<ActionResult<DetailedUserDto>> GetUser(Guid id) {
        try {
            string? currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            string? currentUserRole  = User.FindFirst(ClaimTypes.Role)?.Value;
            bool     isAdmin          = User.IsInRole("Admin");

            logger.LogInformation("User {Email} requesting user details for ID: {UserId}", currentUserEmail, id);

            var query  = new GetUserByIdQuery(id);
            var result = await mediator.Send(query);

            if (result == null) {
                logger.LogWarning("User with ID {UserId} not found", id);
                return NotFound($"User with ID {id} not found");
            }

            // Authorization check: users can only view their own profile unless they're admin
            if (!isAdmin && result.Email != currentUserEmail) {
                logger.LogWarning("User {Email} attempted to access unauthorized user profile {UserId}", currentUserEmail, id);
                return Forbid("You can only view your own profile");
            }

            logger.LogInformation("Successfully retrieved user details for {UserId} by user {Email}", id, currentUserEmail);
            return Ok(result);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving user {UserId}", id);
            return StatusCode(500, "An error occurred while retrieving user details");
        }
    }

    /// <summary>
    /// Create/pre-provision a new user (Admin only)
    /// </summary>
    /// <param name="createUserDto">User creation data</param>
    /// <returns>Created user</returns>
    [HttpPost]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<UserDto>> CreateUser([FromBody] CreateUserDto createUserDto) {
        try {
            if (!ModelState.IsValid) {
                logger.LogWarning("Invalid model state when creating user: {ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            string? currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            logger.LogInformation("Admin user {Email} creating new user: {UserEmail}", currentUserEmail, createUserDto.Email);

            var command = new CreateUserCommand(createUserDto);
            var result  = await mediator.Send(command);

            logger.LogInformation("Successfully created user {UserId} with email {Email} by admin {AdminEmail}",
                result.Id, result.Email, currentUserEmail);

            return CreatedAtAction(
                nameof(GetUser),
                new { id = result.Id },
                result);
        }
        catch (ArgumentException ex) {
            logger.LogWarning(ex, "Invalid argument when creating user");
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex) {
            logger.LogWarning(ex, "Business rule violation when creating user");
            return Conflict(ex.Message);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error creating user");
            return StatusCode(500, "An error occurred while creating the user");
        }
    }

    /// <summary>
    /// Update user profile
    /// Users can update their own profile (except role), admins can update any profile
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="updateUserProfileDto">User profile update data</param>
    /// <returns>Success status</returns>
    [HttpPut("{id:guid}")]
    public async Task<ActionResult> UpdateUserProfile(Guid id, [FromBody] UpdateUserProfileDto updateUserProfileDto) {
        try {
            if (!ModelState.IsValid) {
                logger.LogWarning("Invalid model state when updating user profile: {ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            string? currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            bool isAdmin          = User.IsInRole("Admin");

            // First, get the user to check authorization
            var getUserQuery = new GetUserByIdQuery(id);
            var existingUser = await mediator.Send(getUserQuery);

            if (existingUser == null) {
                logger.LogWarning("User with ID {UserId} not found for profile update", id);
                return NotFound($"User with ID {id} not found");
            }

            // Authorization check: users can only update their own profile unless they're admin
            if (!isAdmin && existingUser.Email != currentUserEmail) {
                logger.LogWarning("User {Email} attempted to update unauthorized user profile {UserId}", currentUserEmail, id);
                return Forbid("You can only update your own profile");
            }

            logger.LogInformation("User {Email} updating profile for user ID: {UserId}", currentUserEmail, id);

            var command = new UpdateUserProfileCommand(updateUserProfileDto);

            await mediator.Send(command);

            logger.LogInformation("Successfully updated profile for user {UserId} by {Email}", id, currentUserEmail);
            return NoContent();
        }
        catch (ArgumentException ex) {
            logger.LogWarning(ex, "Invalid argument when updating user profile");
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex) {
            logger.LogWarning(ex, "Business rule violation when updating user profile");
            return Conflict(ex.Message);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error updating user profile {UserId}", id);
            return StatusCode(500, "An error occurred while updating the user profile");
        }
    }

    /// <summary>
    /// Update user role (Admin only)
    /// Prevents self-demotion from admin role
    /// </summary>
    /// <param name="id">User ID</param>
    /// <param name="updateUserRoleDto">User role update data</param>
    /// <returns>Success status</returns>
    [HttpPut("{id:guid}/role")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult> UpdateUserRole(Guid id, [FromBody] UpdateUserRoleDto updateUserRoleDto) {
        try {
            if (!ModelState.IsValid) {
                logger.LogWarning("Invalid model state when updating user role: {ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            string? currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value;

            // First, get the user to check if it's self-demotion
            var getUserQuery = new GetUserByIdQuery(id);
            var existingUser = await mediator.Send(getUserQuery);

            if (existingUser == null) {
                logger.LogWarning("User with ID {UserId} not found for role update", id);
                return NotFound($"User with ID {id} not found");
            }

            // Prevent self-demotion from admin role
            if (existingUser.Email == currentUserEmail &&
                existingUser.Role == "Admin" &&
                updateUserRoleDto.NewRole != "Admin") {
                logger.LogWarning("Admin user {Email} attempted to demote themselves from admin role", currentUserEmail);
                return BadRequest("You cannot demote yourself from the admin role");
            }

            logger.LogInformation("Admin user {Email} updating role for user ID: {UserId} from {OldRole} to {NewRole}",
                currentUserEmail, id, existingUser.Role, updateUserRoleDto.NewRole);

            var command = new UpdateUserRoleCommand(updateUserRoleDto);

            await mediator.Send(command);

            logger.LogInformation("Successfully updated role for user {UserId} to {NewRole} by admin {AdminEmail}",
                id, updateUserRoleDto.NewRole, currentUserEmail);

            return NoContent();
        }
        catch (ArgumentException ex) {
            logger.LogWarning(ex, "Invalid argument when updating user role");
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex) {
            logger.LogWarning(ex, "Business rule violation when updating user role");
            return Conflict(ex.Message);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error updating user role {UserId}", id);
            return StatusCode(500, "An error occurred while updating the user role");
        }
    }

    /// <summary>
    /// Get pending invitations (Admin only)
    /// </summary>
    /// <param name="pageNumber">Page number (default: 1)</param>
    /// <param name="pageSize">Page size (default: 10, max: 100)</param>
    /// <returns>Paginated list of pending invitations</returns>
    [HttpGet("invitations")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<PendingInvitationsResponse>> GetPendingInvitations(
        [FromQuery] int pageNumber = 1,
        [FromQuery] int pageSize   = 10) {
        try {
            // Validate pagination parameters
            if (pageNumber < 1) pageNumber = 1;
            if (pageSize < 1) pageSize     = 10;
            if (pageSize > 100) pageSize   = 100;

            string? currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            logger.LogInformation("Admin user {Email} requesting pending invitations - Page: {PageNumber}, PageSize: {PageSize}",
                currentUserEmail, pageNumber, pageSize);

            var query  = new GetPendingInvitationsQuery(pageNumber, pageSize);
            var result = await mediator.Send(query);

            logger.LogInformation("Successfully retrieved {InvitationCount} pending invitations out of {TotalCount} for admin user {Email}",
                result.Data.Count, result.TotalCount, currentUserEmail);

            return Ok(result);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error retrieving pending invitations");
            return StatusCode(500, "An error occurred while retrieving pending invitations");
        }
    }

    /// <summary>
    /// Create invitation for new user (Admin only)
    /// </summary>
    /// <param name="createInvitationDto">Invitation creation data</param>
    /// <returns>Created invitation</returns>
    [HttpPost("invite")]
    [Authorize(Policy = "AdminOnly")]
    public async Task<ActionResult<PendingInvitationDto>> CreateInvitation([FromBody] CreatePendingInvitationDto createInvitationDto) {
        try {
            if (!ModelState.IsValid) {
                logger.LogWarning("Invalid model state when creating invitation: {ModelState}", ModelState);
                return BadRequest(ModelState);
            }

            string? currentUserEmail = User.FindFirst(ClaimTypes.Email)?.Value;
            logger.LogInformation("Admin user {Email} creating invitation for email: {InviteEmail}",
                currentUserEmail, createInvitationDto.Email);

            var command = new CreatePendingInvitationCommand(createInvitationDto);
            var result  = await mediator.Send(command);

            logger.LogInformation("Successfully created invitation {InvitationId} for email {Email} by admin {AdminEmail}",
                result.Id, result.Email, currentUserEmail);

            return CreatedAtAction(
                nameof(GetPendingInvitations),
                null,
                result);
        }
        catch (ArgumentException ex) {
            logger.LogWarning(ex, "Invalid argument when creating invitation");
            return BadRequest(ex.Message);
        }
        catch (InvalidOperationException ex) {
            logger.LogWarning(ex, "Business rule violation when creating invitation");
            return Conflict(ex.Message);
        }
        catch (Exception ex) {
            logger.LogError(ex, "Error creating invitation");
            return StatusCode(500, "An error occurred while creating the invitation");
        }
    }
}