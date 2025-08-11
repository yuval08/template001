using FluentValidation;

namespace IntranetStarter.Application.Features.Users.Commands.Validators;

public class DeleteUserCommandValidator : AbstractValidator<DeleteUserCommand> {
    public DeleteUserCommandValidator() {
        RuleFor(x => x.UserId)
            .NotEmpty()
            .WithMessage("User ID is required");

        RuleFor(x => x.DeletedBy)
            .NotEmpty()
            .WithMessage("DeletedBy is required");
    }
}