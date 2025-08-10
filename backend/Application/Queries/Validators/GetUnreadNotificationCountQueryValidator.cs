using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.DTOs;

namespace IntranetStarter.Application.Queries.Validators;

public class GetUnreadNotificationCountQueryValidator : AbstractValidator<GetUnreadNotificationCountQuery> {
    public GetUnreadNotificationCountQueryValidator() {
        RuleFor(x => x.UserId)
            .NotEqual(Guid.Empty)
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("User ID is required");
    }
}