using FluentValidation;
using MediatR;
using Microsoft.Extensions.Logging;

namespace IntranetStarter.Application.Common.Behaviors;

/// <summary>
/// Pipeline behavior for request validation using FluentValidation
/// </summary>
public class ValidationBehavior<TRequest, TResponse>(
    IEnumerable<IValidator<TRequest>>                validators,
    ILogger<ValidationBehavior<TRequest, TResponse>> logger)
    : IPipelineBehavior<TRequest, TResponse>
    where TRequest : IRequest<TResponse> {
    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next, CancellationToken cancellationToken) {
        if (!validators.Any())
            return await next();
        var context = new ValidationContext<TRequest>(request);

        var validationResults = await Task.WhenAll(
            validators.Select(v => v.ValidateAsync(context, cancellationToken)));

        var failures = validationResults
            .SelectMany(r => r.Errors)
            .Where(f => f != null)
            .ToList();

        if (!failures.Any())
            return await next();
        var errorGroups = failures
            .GroupBy(f => f.PropertyName)
            .ToDictionary(
                g => g.Key,
                g => g.Select(f => f.ErrorMessage).ToArray()
            );

        logger.LogWarning(
            "Validation failed for {RequestType}: {ValidationErrors}",
            typeof(TRequest).Name,
            string.Join(", ", errorGroups.Select(kvp => $"{kvp.Key}: [{string.Join(", ", kvp.Value)}]"))
        );

        throw new ValidationException(failures);
    }
}