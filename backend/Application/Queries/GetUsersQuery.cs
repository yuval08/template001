using IntranetStarter.Application.DTOs;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Queries;

public record GetUsersQuery(
    int PageNumber = 1, 
    int PageSize = 10, 
    string? SearchTerm = null,
    string? RoleFilter = null,
    bool? IsActiveFilter = null
) : IRequest<UsersResponse>;

public record UsersResponse(
    List<UserDto> Data,
    int TotalCount,
    int PageNumber,
    int PageSize,
    int TotalPages
);

public class GetUsersQueryHandler : IRequestHandler<GetUsersQuery, UsersResponse>
{
    private readonly IUnitOfWork _unitOfWork;
    private readonly ILogger<GetUsersQueryHandler> _logger;

    public GetUsersQueryHandler(
        IUnitOfWork unitOfWork,
        ILogger<GetUsersQueryHandler> logger)
    {
        _unitOfWork = unitOfWork;
        _logger = logger;
    }

    public async Task<UsersResponse> Handle(GetUsersQuery request, CancellationToken cancellationToken)
    {
        _logger.LogInformation("Fetching users - Page: {PageNumber}, PageSize: {PageSize}, SearchTerm: {SearchTerm}, RoleFilter: {RoleFilter}, IsActiveFilter: {IsActiveFilter}", 
            request.PageNumber, request.PageSize, request.SearchTerm, request.RoleFilter, request.IsActiveFilter);

        var repository = _unitOfWork.Repository<User>();
        
        // Get all users (in a real implementation, you'd want to implement pagination at the repository level)
        var allUsers = await repository.GetAllAsync(cancellationToken);
        
        // Apply search filter if provided
        if (!string.IsNullOrWhiteSpace(request.SearchTerm))
        {
            allUsers = allUsers.Where(u => 
                u.Email.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                u.FirstName.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                u.LastName.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                u.FullName.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                (!string.IsNullOrWhiteSpace(u.Department) && u.Department.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase)) ||
                (!string.IsNullOrWhiteSpace(u.JobTitle) && u.JobTitle.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase)));
        }

        // Apply role filter if provided
        if (!string.IsNullOrWhiteSpace(request.RoleFilter))
        {
            allUsers = allUsers.Where(u => u.Role.Equals(request.RoleFilter, StringComparison.OrdinalIgnoreCase));
        }

        // Apply active status filter if provided
        if (request.IsActiveFilter.HasValue)
        {
            allUsers = allUsers.Where(u => u.IsActive == request.IsActiveFilter.Value);
        }

        var totalCount = allUsers.Count();
        var totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        // Apply pagination and sort by creation date (newest first)
        var users = allUsers
            .OrderByDescending(u => u.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(MapToDto)
            .ToList();

        _logger.LogInformation("Retrieved {Count} users out of {TotalCount}", users.Count, totalCount);

        return new UsersResponse(users, totalCount, request.PageNumber, request.PageSize, totalPages);
    }

    private static UserDto MapToDto(User user)
    {
        return new UserDto(
            user.Id,
            user.Email,
            user.FirstName,
            user.LastName,
            user.Avatar,
            user.Role,
            user.Department,
            user.JobTitle,
            user.IsActive
        );
    }
}