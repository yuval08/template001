using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.Features.Users.Queries;
using IntranetStarter.Domain.Constants;

namespace IntranetStarter.Application.Features.Users.Queries.Validators;

public class GetUsersQueryValidator : AbstractValidator<GetUsersQuery> {
    public GetUsersQueryValidator() {
        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithCode(ValidationErrorCodes.InvalidRange)
            .WithMessage("Page number must be greater than or equal to 1");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithCode(ValidationErrorCodes.InvalidRange)
            .WithMessage("Page size must be between 1 and 100");

        RuleFor(x => x.SearchTerm)
            .MaximumLength(200)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage("Search term must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.SearchTerm));

        RuleFor(x => x.RoleFilter)
            .Must(role => string.IsNullOrEmpty(role) || UserRoles.IsValidRole(role))
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage($"Invalid role filter. Must be one of: {string.Join(", ", UserRoles.All)}")
            .When(x => !string.IsNullOrEmpty(x.RoleFilter));

        RuleFor(x => x.SortBy)
            .Must(sortBy => string.IsNullOrEmpty(sortBy) || IsValidSortField(sortBy))
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage("Invalid sort field. Must be one of: email, firstname, lastname, fullname, role, jobtitle, department, status, createdat")
            .When(x => !string.IsNullOrEmpty(x.SortBy));
    }

    private static bool IsValidSortField(string sortBy) {
        var validFields = new[] { 
            "email", "firstname", "lastname", "fullname", 
            "role", "jobtitle", "department", "status", 
            "isactive", "createdat" 
        };
        return validFields.Contains(sortBy.ToLowerInvariant());
    }
}