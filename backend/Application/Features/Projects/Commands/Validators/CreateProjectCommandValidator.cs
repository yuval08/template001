using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Domain.Entities;

namespace IntranetStarter.Application.Features.Projects.Commands.Validators;

public class CreateProjectCommandValidator : AbstractValidator<CreateProjectCommand> {
    public CreateProjectCommandValidator() {
        RuleFor(x => x.Project)
            .NotNull()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage("Project data is required");

        When(x => x.Project != null, () => {
            RuleFor(x => x.Project.Name)
                .NotEmpty()
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("Project name is required")
                .MaximumLength(200)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("Project name must not exceed 200 characters");

            RuleFor(x => x.Project.Description)
                .NotEmpty()
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("Project description is required")
                .MaximumLength(2000)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("Description must not exceed 2000 characters");

            RuleFor(x => x.Project.Status)
                .IsInEnum()
                .WithCode(ValidationErrorCodes.InvalidFormat)
                .WithMessage("Invalid project status");

            RuleFor(x => x.Project.Budget)
                .GreaterThanOrEqualTo(0)
                .WithCode(ValidationErrorCodes.InvalidRange)
                .WithMessage("Budget must be a positive value");

            RuleFor(x => x.Project.Priority)
                .InclusiveBetween(1, 5)
                .WithCode(ValidationErrorCodes.InvalidRange)
                .WithMessage("Priority must be between 1 and 5");

            RuleFor(x => x.Project.StartDate)
                .LessThanOrEqualTo(x => x.Project.EndDate)
                .WithCode(ValidationErrorCodes.InvalidRange)
                .WithMessage("Start date must be before or equal to end date")
                .When(x => x.Project.StartDate.HasValue && x.Project.EndDate.HasValue);

            RuleFor(x => x.Project.ClientName)
                .MaximumLength(200)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("Client name must not exceed 200 characters")
                .When(x => !string.IsNullOrEmpty(x.Project.ClientName));

            RuleFor(x => x.Project.Tags)
                .MaximumLength(500)
                .WithCode(ValidationErrorCodes.InvalidLength)
                .WithMessage("Tags must not exceed 500 characters")
                .When(x => !string.IsNullOrEmpty(x.Project.Tags));

            RuleFor(x => x.Project.TeamMemberIds)
                .NotNull()
                .WithCode(ValidationErrorCodes.Required)
                .WithMessage("Team member IDs list is required");

            RuleFor(x => x.Project.TeamMemberIds)
                .Must(ids => ids.Count > 0)
                .WithCode(ValidationErrorCodes.BusinessRule)
                .WithMessage("At least one team member is required")
                .When(x => x.Project.TeamMemberIds != null);

            RuleForEach(x => x.Project.TeamMemberIds)
                .NotEqual(Guid.Empty)
                .WithCode(ValidationErrorCodes.InvalidFormat)
                .WithMessage("Invalid team member ID");
        });
    }
}