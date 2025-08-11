using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.Features.Projects.DTOs;

namespace IntranetStarter.Application.Features.Projects.Queries.Validators;

public class GetProjectsQueryValidator : AbstractValidator<GetProjectsQuery> {
    public GetProjectsQueryValidator() {
        RuleFor(x => x.Page)
            .GreaterThanOrEqualTo(1)
            .WithCode(ValidationErrorCodes.InvalidRange)
            .WithMessage("Page number must be greater than or equal to 1");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithCode(ValidationErrorCodes.InvalidRange)
            .WithMessage("Page size must be between 1 and 100");

        RuleFor(x => x.Search)
            .MaximumLength(200)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage("Search term must not exceed 200 characters")
            .When(x => !string.IsNullOrEmpty(x.Search));
    }
}