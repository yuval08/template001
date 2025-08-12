using System.Net;
using System.Text.Json;
using FluentValidation;
using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Interfaces;

namespace IntranetStarter.Api.Middleware;

/// <summary>
/// Global exception middleware for handling all unhandled exceptions
/// and providing standardized error responses
/// </summary>
public class GlobalExceptionMiddleware(
    RequestDelegate next,
    ILogger<GlobalExceptionMiddleware> logger,
    IHostEnvironment environment,
    IServiceProvider serviceProvider) {
    public async Task InvokeAsync(HttpContext context) {
        try {
            await next(context);
        }
        catch (Exception ex) {
            await HandleExceptionAsync(context, ex);
        }
    }

    private async Task HandleExceptionAsync(HttpContext context, Exception exception) {
        string correlationId = GetOrCreateCorrelationId(context);

        logger.LogError(exception,
            "An unhandled exception occurred. CorrelationId: {CorrelationId}, Path: {Path}, Method: {Method}",
            correlationId, context.Request.Path, context.Request.Method);

        var errorResponse = CreateErrorResponse(exception, correlationId);

        context.Response.ContentType = "application/json";
        context.Response.StatusCode = errorResponse.StatusCode;

        var jsonOptions = new JsonSerializerOptions {
            PropertyNamingPolicy = JsonNamingPolicy.CamelCase
        };

        string jsonResponse = JsonSerializer.Serialize(errorResponse, jsonOptions);
        await context.Response.WriteAsync(jsonResponse);
    }

    private ErrorResponse CreateErrorResponse(Exception exception, string correlationId) {
        // Create a scope to resolve scoped services
        using var scope = serviceProvider.CreateScope();
        var localizationService = scope.ServiceProvider.GetRequiredService<ILocalizationService>();
        
        return exception switch {
            ValidationException validationException => new ErrorResponse {
                Message = localizationService.GetString("Validation.ValidationFailed"),
                StatusCode = (int)HttpStatusCode.BadRequest,
                ErrorCode = "VALIDATION_ERROR",
                CorrelationId = correlationId,
                Errors = validationException.Errors?
                .GroupBy(e => e.PropertyName)
                .ToDictionary(
                    g => g.Key,
                    g => g.Select(e => e.ErrorMessage).ToArray()
                ),
                Details = environment.IsDevelopment() ? exception.ToString() : null
            },

            IDomainException domainException => new ErrorResponse {
                Message = domainException.Message,
                StatusCode = (int)HttpStatusCode.BadRequest,
                ErrorCode = domainException.ErrorCode,
                CorrelationId = correlationId,
                Details = environment.IsDevelopment() ? exception.ToString() : null
            },

            FileStoreException fileStoreException => new ErrorResponse {
                Message = fileStoreException.Message,
                StatusCode = (int)HttpStatusCode.InternalServerError,
                ErrorCode = "FILE_STORE_ERROR",
                CorrelationId = correlationId,
                Details = environment.IsDevelopment() ? exception.ToString() : null
            },

            UnauthorizedAccessException => new ErrorResponse {
                Message = localizationService.GetString("Auth.Unauthorized"),
                StatusCode = (int)HttpStatusCode.Forbidden,
                ErrorCode = "ACCESS_DENIED",
                CorrelationId = correlationId,
                Details = environment.IsDevelopment() ? exception.ToString() : null
            },

            ArgumentNullException argumentNullException => new ErrorResponse {
                Message = $"Required parameter '{argumentNullException.ParamName}' is missing",
                StatusCode = (int)HttpStatusCode.BadRequest,
                ErrorCode = "MISSING_PARAMETER",
                CorrelationId = correlationId,
                Details = environment.IsDevelopment() ? exception.ToString() : null
            },

            ArgumentException argumentException => new ErrorResponse {
                Message = argumentException.Message,
                StatusCode = (int)HttpStatusCode.BadRequest,
                ErrorCode = "INVALID_ARGUMENT",
                CorrelationId = correlationId,
                Details = environment.IsDevelopment() ? exception.ToString() : null
            },

            KeyNotFoundException => new ErrorResponse {
                Message = localizationService.GetString("General.NotFound"),
                StatusCode = (int)HttpStatusCode.NotFound,
                ErrorCode = "RESOURCE_NOT_FOUND",
                CorrelationId = correlationId,
                Details = environment.IsDevelopment() ? exception.ToString() : null
            },

            TimeoutException => new ErrorResponse {
                Message = "The operation timed out",
                StatusCode = (int)HttpStatusCode.RequestTimeout,
                ErrorCode = "OPERATION_TIMEOUT",
                CorrelationId = correlationId,
                Details = environment.IsDevelopment() ? exception.ToString() : null
            },

            _ => new ErrorResponse {
                Message = environment.IsDevelopment()
                ? exception.Message
                : localizationService.GetString("General.Error"),
                StatusCode = (int)HttpStatusCode.InternalServerError,
                ErrorCode = "INTERNAL_ERROR",
                CorrelationId = correlationId,
                Details = environment.IsDevelopment() ? exception.ToString() : null
            }
        };
    }

    private static string GetOrCreateCorrelationId(HttpContext context) {
        const string correlationIdHeader = "X-Correlation-Id";

        if (context.Request.Headers.TryGetValue(correlationIdHeader, out var correlationId)) {
            return correlationId.FirstOrDefault() ?? GenerateCorrelationId();
        }

        string newCorrelationId = GenerateCorrelationId();
        context.Response.Headers.Append(correlationIdHeader, newCorrelationId);
        return newCorrelationId;
    }

    private static string GenerateCorrelationId() {
        return Guid.NewGuid().ToString("N")[..8];
    }
}

/// <summary>
/// Standardized error response model
/// </summary>
public class ErrorResponse {
    public string Message { get; set; } = string.Empty;
    public int StatusCode { get; set; }
    public string ErrorCode { get; set; } = string.Empty;
    public string CorrelationId { get; set; } = string.Empty;
    public Dictionary<string, string[]>? Errors { get; set; }
    public string? Details { get; set; }
    public DateTime Timestamp { get; set; } = DateTime.UtcNow;
}