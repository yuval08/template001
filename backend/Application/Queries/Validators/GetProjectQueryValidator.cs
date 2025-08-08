using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.DTOs;

namespace IntranetStarter.Application.Queries.Validators;

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