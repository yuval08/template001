using IntranetStarter.Application.Features.Users.DTOs;
using IntranetStarter.Application.Features.Users.Mappers;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Features.Users.Queries;

public record GetUsersQuery(
    int     PageNumber     = 1,
    int     PageSize       = 10,
    string? SearchTerm     = null,
    string? RoleFilter     = null,
    bool?   IsActiveFilter = null,
    string? SortBy         = null,
    bool    SortDescending = false,
    bool    ShowInactive   = false
) : IRequest<UsersResponse>;

public class GetUsersQueryHandler(IUnitOfWork unitOfWork, ILogger<GetUsersQueryHandler> logger) : IRequestHandler<GetUsersQuery, UsersResponse> {
    public async Task<UsersResponse> Handle(GetUsersQuery request, CancellationToken cancellationToken) {
        logger.LogInformation("Fetching users - Page: {PageNumber}, PageSize: {PageSize}, SearchTerm: {SearchTerm}, RoleFilter: {RoleFilter}, IsActiveFilter: {IsActiveFilter}, SortBy: {SortBy}, SortDescending: {SortDescending}, ShowInactive: {ShowInactive}",
            request.PageNumber, request.PageSize, request.SearchTerm, request.RoleFilter, request.IsActiveFilter, request.SortBy, request.SortDescending, request.ShowInactive);

        var repository = unitOfWork.Repository<User>();

        // Get all users (in a real implementation, you'd want to implement pagination at the repository level)
        var allUsers = await repository.GetAllAsync(cancellationToken);

        // Apply active status filter (show only active by default unless ShowInactive is true)
        if (!request.ShowInactive) {
            allUsers = allUsers.Where(u => u.IsActive);
        } else if (request.IsActiveFilter.HasValue) {
            allUsers = allUsers.Where(u => u.IsActive == request.IsActiveFilter.Value);
        }

        // Apply search filter if provided
        if (!string.IsNullOrWhiteSpace(request.SearchTerm)) {
            allUsers = allUsers.Where(u =>
                u.Email.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                u.FirstName.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                u.LastName.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                u.FullName.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase) ||
                (!string.IsNullOrWhiteSpace(u.Department) && u.Department.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase)) ||
                (!string.IsNullOrWhiteSpace(u.JobTitle) && u.JobTitle.Contains(request.SearchTerm, StringComparison.OrdinalIgnoreCase)));
        }

        // Apply role filter if provided
        if (!string.IsNullOrWhiteSpace(request.RoleFilter)) {
            allUsers = allUsers.Where(u => u.Role.Equals(request.RoleFilter, StringComparison.OrdinalIgnoreCase));
        }

        // Apply sorting
        allUsers = ApplySorting(allUsers, request.SortBy, request.SortDescending);

        int totalCount = allUsers.Count();
        int totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        // Apply pagination
        var users = allUsers
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => u.MapToUserDto())
            .ToList();

        logger.LogInformation("Retrieved {Count} users out of {TotalCount}", users.Count, totalCount);

        return new UsersResponse(users, totalCount, request.PageNumber, request.PageSize, totalPages);
    }

    private static IEnumerable<User> ApplySorting(IEnumerable<User> users, string? sortBy, bool sortDescending) {
        return sortBy?.ToLowerInvariant() switch {
            "email" => sortDescending 
                ? users.OrderByDescending(u => u.Email) 
                : users.OrderBy(u => u.Email),
            "firstname" => sortDescending 
                ? users.OrderByDescending(u => u.FirstName) 
                : users.OrderBy(u => u.FirstName),
            "lastname" => sortDescending 
                ? users.OrderByDescending(u => u.LastName) 
                : users.OrderBy(u => u.LastName),
            "fullname" => sortDescending 
                ? users.OrderByDescending(u => u.FullName) 
                : users.OrderBy(u => u.FullName),
            "role" => sortDescending 
                ? users.OrderByDescending(u => u.Role) 
                : users.OrderBy(u => u.Role),
            "jobtitle" => sortDescending 
                ? users.OrderByDescending(u => u.JobTitle ?? string.Empty) 
                : users.OrderBy(u => u.JobTitle ?? string.Empty),
            "department" => sortDescending 
                ? users.OrderByDescending(u => u.Department ?? string.Empty) 
                : users.OrderBy(u => u.Department ?? string.Empty),
            "status" or "isactive" => sortDescending 
                ? users.OrderByDescending(u => u.IsActive) 
                : users.OrderBy(u => u.IsActive),
            "createdat" => sortDescending 
                ? users.OrderByDescending(u => u.CreatedAt) 
                : users.OrderBy(u => u.CreatedAt),
            _ => users.OrderByDescending(u => u.CreatedAt) // Default sort by creation date (newest first)
        };
    }

}