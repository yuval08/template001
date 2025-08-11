using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.Features.Projects.DTOs;

namespace IntranetStarter.Application.Features.Projects.Queries.Validators;

public class GetProjectQueryValidator : AbstractValidator<GetProjectQuery>
{
    public GetProjectQueryValidator()
    {
        RuleFor(x => x.Id)
            .NotEqual(Guid.Empty)
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("Project ID is required");
    }
}