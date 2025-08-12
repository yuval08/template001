using FluentValidation;
using IntranetStarter.Application.Common.Validation;
using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Entities;

namespace IntranetStarter.Application.Features.Projects.Commands.Validators;

public class CreateProjectCommandValidator : AbstractValidator<CreateProjectCommand> {
    public CreateProjectCommandValidator(ILocalizationService localizationService) {
        RuleFor(x => x.Project)
        .NotNull()
        .WithCode(ValidationErrorCodes.Required)
        .WithMessage(localizationService.GetString("Validation.ProjectDataRequired"));

        When(x => x.Project != null, () =>
        {
            RuleFor(x => x.Project.Name)
            .NotEmpty()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(localizationService.GetString("Validation.ProjectNameRequired"))
            .MaximumLength(200)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(localizationService.GetString("Validation.ProjectNameMaxLength", 200));

            RuleFor(x => x.Project.Description)
            .NotEmpty()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(localizationService.GetString("Validation.ProjectDescriptionRequired"))
            .MaximumLength(2000)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(localizationService.GetString("Validation.ProjectDescriptionMaxLength", 2000));

            RuleFor(x => x.Project.Status)
            .IsInEnum()
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage(localizationService.GetString("Validation.InvalidProjectStatus"));

            RuleFor(x => x.Project.Budget)
            .GreaterThanOrEqualTo(0)
            .WithCode(ValidationErrorCodes.InvalidRange)
            .WithMessage(localizationService.GetString("Validation.BudgetMustBePositive"));

            RuleFor(x => x.Project.Priority)
            .InclusiveBetween(1, 5)
            .WithCode(ValidationErrorCodes.InvalidRange)
            .WithMessage(localizationService.GetString("Validation.PriorityRange", 1, 5));

            RuleFor(x => x.Project.StartDate)
            .LessThanOrEqualTo(x => x.Project.EndDate)
            .WithCode(ValidationErrorCodes.InvalidRange)
            .WithMessage(localizationService.GetString("Validation.StartDateAfterEndDate"))
            .When(x => x.Project.StartDate.HasValue && x.Project.EndDate.HasValue);

            RuleFor(x => x.Project.ClientName)
            .MaximumLength(200)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(localizationService.GetString("Validation.ClientNameMaxLength", 200))
            .When(x => !string.IsNullOrEmpty(x.Project.ClientName));

            RuleFor(x => x.Project.Tags)
            .MaximumLength(500)
            .WithCode(ValidationErrorCodes.InvalidLength)
            .WithMessage(localizationService.GetString("Validation.TagsMaxLength", 500))
            .When(x => !string.IsNullOrEmpty(x.Project.Tags));

            RuleFor(x => x.Project.TeamMemberIds)
            .NotNull()
            .WithCode(ValidationErrorCodes.Required)
            .WithMessage(localizationService.GetString("Validation.TeamMemberIdsRequired"));

            RuleFor(x => x.Project.TeamMemberIds)
            .Must(ids => ids.Count > 0)
            .WithCode(ValidationErrorCodes.BusinessRule)
            .WithMessage(localizationService.GetString("Validation.AtLeastOneTeamMember"))
            .When(x => x.Project.TeamMemberIds != null);

            RuleForEach(x => x.Project.TeamMemberIds)
            .NotEqual(Guid.Empty)
            .WithCode(ValidationErrorCodes.InvalidFormat)
            .WithMessage(localizationService.GetString("Validation.InvalidTeamMemberId"));
        });
    }
}