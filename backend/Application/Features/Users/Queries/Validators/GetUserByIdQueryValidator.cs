using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.Features.Users.Queries;

namespace IntranetStarter.Application.Features.Users.Queries.Validators;

public class GetUserByIdQueryValidator : AbstractValidator<GetUserByIdQuery> {
    public GetUserByIdQueryValidator() {
        RuleFor(x => x.UserId)
            .NotEqual(Guid.Empty)
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("User ID is required");
    }
}