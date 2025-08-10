using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.DTOs;

namespace IntranetStarter.Application.Queries.Validators;

public class GetUserNotificationsQueryValidator : AbstractValidator<GetUserNotificationsQuery> {
    public GetUserNotificationsQueryValidator() {
        RuleFor(x => x.UserId)
            .NotEqual(Guid.Empty)
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("User ID is required");

        RuleFor(x => x.PageNumber)
            .GreaterThanOrEqualTo(1)
            .WithCode(ValidationErrorCodes.InvalidRange)
            .WithMessage("Page number must be greater than or equal to 1");

        RuleFor(x => x.PageSize)
            .InclusiveBetween(1, 100)
            .WithCode(ValidationErrorCodes.InvalidRange)
            .WithMessage("Page size must be between 1 and 100");
    }
}