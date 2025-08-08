using IntranetStarter.Application.DTOs;
using IntranetStarter.Application.Mappers;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Domain.Interfaces;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Queries;


public class GetUsersQueryHandler(IUnitOfWork unitOfWork, ILogger<GetUsersQueryHandler> logger) : IRequestHandler<GetUsersQuery, UsersResponse> {
    public async Task<UsersResponse> Handle(GetUsersQuery request, CancellationToken cancellationToken) {
        logger.LogInformation("Fetching users - Page: {PageNumber}, PageSize: {PageSize}, SearchTerm: {SearchTerm}, RoleFilter: {RoleFilter}, IsActiveFilter: {IsActiveFilter}",
            request.PageNumber, request.PageSize, request.SearchTerm, request.RoleFilter, request.IsActiveFilter);

        var repository = unitOfWork.Repository<User>();

        // Get all users (in a real implementation, you'd want to implement pagination at the repository level)
        var allUsers = await repository.GetAllAsync(cancellationToken);

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

        // Apply active status filter if provided
        if (request.IsActiveFilter.HasValue) {
            allUsers = allUsers.Where(u => u.IsActive == request.IsActiveFilter.Value);
        }

        int totalCount = allUsers.Count();
        int totalPages = (int)Math.Ceiling(totalCount / (double)request.PageSize);

        // Apply pagination and sort by creation date (newest first)
        var users = allUsers
            .OrderByDescending(u => u.CreatedAt)
            .Skip((request.PageNumber - 1) * request.PageSize)
            .Take(request.PageSize)
            .Select(u => u.MapToUserDto())
            .ToList();

        logger.LogInformation("Retrieved {Count} users out of {TotalCount}", users.Count, totalCount);

        return new UsersResponse(users, totalCount, request.PageNumber, request.PageSize, totalPages);
    }

}