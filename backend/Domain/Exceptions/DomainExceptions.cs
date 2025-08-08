using IntranetStarter.Domain.Interfaces;

namespace IntranetStarter.Domain.Exceptions;

/// <summary>
/// Base class for all domain exceptions
/// </summary>
public abstract class DomainException : Exception, IDomainException {
    public abstract string ErrorCode { get; }

    protected DomainException(string message) : base(message) {
    }

    protected DomainException(string message, Exception innerException) : base(message, innerException) {
    }
}

/// <summary>
/// Thrown when a business rule validation fails
/// </summary>
public class BusinessRuleViolationException : DomainException {
    public override string ErrorCode => "BUSINESS_RULE_VIOLATION";

    public BusinessRuleViolationException(string message) : base(message) {
    }

    public BusinessRuleViolationException(string message, Exception innerException) : base(message, innerException) {
    }
}

/// <summary>
/// Thrown when an entity is not found
/// </summary>
public class EntityNotFoundException(string entityType, string entityId) : DomainException($"{entityType} with ID '{entityId}' was not found") {
    public override string ErrorCode  => "ENTITY_NOT_FOUND";
    public          string EntityType { get; } = entityType;
    public          string EntityId   { get; } = entityId;
}

/// <summary>
/// Thrown when trying to create an entity that already exists
/// </summary>
public class EntityAlreadyExistsException(string entityType, string entityId) : DomainException($"{entityType} with ID '{entityId}' already exists") {
    public override string ErrorCode  => "ENTITY_ALREADY_EXISTS";
    public          string EntityType { get; } = entityType;
    public          string EntityId   { get; } = entityId;
}

/// <summary>
/// Thrown when an operation is not permitted based on current state
/// </summary>
public class InvalidOperationException : DomainException {
    public override string ErrorCode => "INVALID_OPERATION";

    public InvalidOperationException(string message) : base(message) {
    }

    public InvalidOperationException(string message, Exception innerException) : base(message, innerException) {
    }
}

/// <summary>
/// Thrown when user lacks sufficient permissions
/// </summary>
public class InsufficientPermissionsException(string requiredPermission) : DomainException($"Operation requires '{requiredPermission}' permission") {
    public override string ErrorCode          => "INSUFFICIENT_PERMISSIONS";
    public          string RequiredPermission { get; } = requiredPermission;
}

/// <summary>
/// Thrown when a duplicate operation is attempted
/// </summary>
public class DuplicateOperationException(string message) : DomainException(message) {
    public override string ErrorCode => "DUPLICATE_OPERATION";
}

/// <summary>
/// Thrown when a resource limit is exceeded
/// </summary>
public class ResourceLimitExceededException(string resourceType, int currentCount, int maxAllowed)
    : DomainException($"Resource limit exceeded for {resourceType}. Current: {currentCount}, Max: {maxAllowed}") {
    public override string ErrorCode    => "RESOURCE_LIMIT_EXCEEDED";
    public          string ResourceType { get; } = resourceType;
    public          int    CurrentCount { get; } = currentCount;
    public          int    MaxAllowed   { get; } = maxAllowed;
}

/// <summary>
/// Thrown when data is in an invalid state
/// </summary>
public class InvalidDataStateException : DomainException {
    public override string ErrorCode => "INVALID_DATA_STATE";

    public InvalidDataStateException(string message) : base(message) {
    }

    public InvalidDataStateException(string message, Exception innerException) : base(message, innerException) {
    }
}

/// <summary>
/// Thrown when an external service is unavailable
/// </summary>
public class ExternalServiceUnavailableException : DomainException {
    public override string ErrorCode   => "EXTERNAL_SERVICE_UNAVAILABLE";
    public          string ServiceName { get; }

    public ExternalServiceUnavailableException(string serviceName)
        : base($"External service '{serviceName}' is currently unavailable") {
        ServiceName = serviceName;
    }

    public ExternalServiceUnavailableException(string serviceName, Exception innerException)
        : base($"External service '{serviceName}' is currently unavailable", innerException) {
        ServiceName = serviceName;
    }
}

/// <summary>
/// Thrown when data validation fails at domain level
/// </summary>
public class DomainValidationException : DomainException {
    public override string                       ErrorCode        => "DOMAIN_VALIDATION_ERROR";
    public          Dictionary<string, string[]> ValidationErrors { get; }

    public DomainValidationException(string field, string error)
        : base($"Validation failed for {field}: {error}") {
        ValidationErrors = new Dictionary<string, string[]> {
            [field] = [error]
        };
    }

    public DomainValidationException(Dictionary<string, string[]> validationErrors)
        : base("Domain validation failed") {
        ValidationErrors = validationErrors;
    }
}

/// <summary>
/// Thrown when a configuration is invalid or missing
/// </summary>
public class ConfigurationException(string configurationKey, string message) : DomainException($"Configuration error for '{configurationKey}': {message}") {
    public override string ErrorCode        => "CONFIGURATION_ERROR";
    public          string ConfigurationKey { get; } = configurationKey;
}