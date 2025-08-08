using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.DTOs;
using IntranetStarter.Domain.Constants;

namespace IntranetStarter.Application.Queries.Validators;

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
    }
}