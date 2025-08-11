using FluentValidation;
using IntranetStarter.Application.Common.Validation;

namespace IntranetStarter.Application.Features.Invitations.Queries.Validators;

public class GetPendingInvitationsQueryValidator : AbstractValidator<GetPendingInvitationsQuery> {
    public GetPendingInvitationsQueryValidator() {
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