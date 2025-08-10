using IntranetStarter.Domain.Entities;

namespace IntranetStarter.Application.Interfaces;

public interface INotificationRepository {
    Task<Notification> CreateAsync(Notification notification, CancellationToken cancellationToken = default);
    Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default);
    Task<IEnumerable<Notification>> GetUserNotificationsAsync(
        Guid userId, 
        int pageNumber = 1, 
        int pageSize = 20, 
        bool? isRead = null,
        CancellationToken cancellationToken = default);
    Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> MarkAsReadAsync(Guid id, CancellationToken cancellationToken = default);
    Task<int> MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default);
    Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default);
    Task<int> DeleteOldNotificationsAsync(int daysOld = 30, CancellationToken cancellationToken = default);
}