using IntranetStarter.Domain.Common;

namespace IntranetStarter.Domain.Entities;

public class Notification : BaseEntity {
    public required Guid UserId { get; set; }
    public required string Title { get; set; }
    public required string Message { get; set; }
    public required NotificationType Type { get; set; }
    public bool IsRead { get; set; }
    public DateTime? ReadAt { get; set; }
    public string? ActionUrl { get; set; }
    public string? Metadata { get; set; } // JSON for additional data
    
    // Navigation property
    public virtual User User { get; set; } = null!;
}

public enum NotificationType {
    Info,
    Success,
    Warning,
    Error
}