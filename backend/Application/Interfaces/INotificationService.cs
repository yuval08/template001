namespace IntranetStarter.Application.Interfaces;

public interface INotificationService {
    Task SendNotificationAsync(string       userId,  string            message, NotificationType type = NotificationType.Info, CancellationToken cancellationToken = default);
    Task SendNotificationToAllAsync(string  message, NotificationType  type                                             = NotificationType.Info, CancellationToken cancellationToken = default);
    Task SendNotificationUpdateAsync(string userId,  CancellationToken cancellationToken                                = default);
    Task SendUnreadCountUpdateAsync(string  userId,  int               unreadCount, CancellationToken cancellationToken = default);
}

public enum NotificationType {
    Info,
    Success,
    Warning,
    Error
}