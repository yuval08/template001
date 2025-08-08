namespace IntranetStarter.Domain.Interfaces;

/// <summary>
/// Interface for domain-specific exceptions that carry error codes
/// for client-side handling
/// </summary>
public interface IDomainException
{
    /// <summary>
    /// Error code for client-side handling and categorization
    /// </summary>
    string ErrorCode { get; }
    
    /// <summary>
    /// User-friendly error message
    /// </summary>
    string Message { get; }
}