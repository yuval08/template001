using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.Features.Search.DTOs;

namespace IntranetStarter.Application.Features.Search.Queries.Validators;

public class GetUniversalSearchQueryValidator : AbstractValidator<GetUniversalSearchQuery>
{
    public GetUniversalSearchQueryValidator()
    {
        RuleFor(x => x.SearchTerm)
            .MinimumLength(1)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage("Search term must be at least 1 character long")
            .When(x => !string.IsNullOrWhiteSpace(x.SearchTerm));

        RuleFor(x => x.SearchTerm)
            .MaximumLength(500)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage("Search term must not exceed 500 characters")
            .When(x => !string.IsNullOrWhiteSpace(x.SearchTerm));

        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1)
            .WithCode(ValidationErrorCodes.InvalidRange)
            .WithMessage("Page number must be greater than or equal to 1");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithCode(ValidationErrorCodes.InvalidRange)
            .WithMessage("Page size must be between 1 and 100");

        RuleFor(x => x.EntityTypes)
            .Must(entityTypes => entityTypes == null || entityTypes.All(et => Enum.IsDefined(typeof(SearchEntityType), et)))
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage("All entity types must be valid")
            .When(x => x.EntityTypes != null);

        RuleFor(x => x.EntityTypes)
            .Must(entityTypes => entityTypes == null || entityTypes.Count <= 10)
            .WithCode(ValidationErrorCodes.InvalidRange)
            .WithMessage("Cannot specify more than 10 entity types")
            .When(x => x.EntityTypes != null);
    }
}