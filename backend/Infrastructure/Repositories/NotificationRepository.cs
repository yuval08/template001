using IntranetStarter.Application.Interfaces;
using IntranetStarter.Domain.Entities;
using IntranetStarter.Infrastructure.Data;
using Microsoft.EntityFrameworkCore;

namespace IntranetStarter.Infrastructure.Repositories;

public class NotificationRepository : INotificationRepository {
    private readonly ApplicationDbContext _context;

    public NotificationRepository(ApplicationDbContext context) {
        _context = context;
    }

    public async Task<Notification> CreateAsync(Notification notification, CancellationToken cancellationToken = default) {
        _context.Notifications.Add(notification);
        await _context.SaveChangesAsync(cancellationToken);
        return notification;
    }

    public async Task<Notification?> GetByIdAsync(Guid id, CancellationToken cancellationToken = default) {
        return await _context.Notifications
            .Include(n => n.User)
            .FirstOrDefaultAsync(n => n.Id == id, cancellationToken);
    }

    public async Task<IEnumerable<Notification>> GetUserNotificationsAsync(
        Guid userId, 
        int pageNumber = 1, 
        int pageSize = 20, 
        bool? isRead = null,
        CancellationToken cancellationToken = default) {
        
        var query = _context.Notifications
            .Include(n => n.User)
            .Where(n => n.UserId == userId);

        if (isRead.HasValue) {
            query = query.Where(n => n.IsRead == isRead.Value);
        }

        return await query
            .OrderByDescending(n => n.CreatedAt)
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .ToListAsync(cancellationToken);
    }

    public async Task<int> GetUnreadCountAsync(Guid userId, CancellationToken cancellationToken = default) {
        return await _context.Notifications
            .CountAsync(n => n.UserId == userId && !n.IsRead, cancellationToken);
    }

    public async Task<bool> MarkAsReadAsync(Guid id, CancellationToken cancellationToken = default) {
        var notification = await _context.Notifications.FindAsync(new object[] { id }, cancellationToken);
        if (notification == null) return false;

        notification.IsRead = true;
        notification.ReadAt = DateTime.UtcNow;
        notification.UpdatedAt = DateTime.UtcNow;
        
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<int> MarkAllAsReadAsync(Guid userId, CancellationToken cancellationToken = default) {
        var unreadNotifications = await _context.Notifications
            .Where(n => n.UserId == userId && !n.IsRead)
            .ToListAsync(cancellationToken);

        if (!unreadNotifications.Any()) return 0;

        var now = DateTime.UtcNow;
        foreach (var notification in unreadNotifications) {
            notification.IsRead = true;
            notification.ReadAt = now;
            notification.UpdatedAt = now;
        }

        await _context.SaveChangesAsync(cancellationToken);
        return unreadNotifications.Count;
    }

    public async Task<bool> DeleteAsync(Guid id, CancellationToken cancellationToken = default) {
        var notification = await _context.Notifications.FindAsync(new object[] { id }, cancellationToken);
        if (notification == null) return false;

        _context.Notifications.Remove(notification);
        await _context.SaveChangesAsync(cancellationToken);
        return true;
    }

    public async Task<int> DeleteOldNotificationsAsync(int daysOld = 30, CancellationToken cancellationToken = default) {
        var cutoffDate = DateTime.UtcNow.AddDays(-daysOld);
        var oldNotifications = await _context.Notifications
            .Where(n => n.CreatedAt < cutoffDate && n.IsRead)
            .ToListAsync(cancellationToken);

        if (!oldNotifications.Any()) return 0;

        _context.Notifications.RemoveRange(oldNotifications);
        await _context.SaveChangesAsync(cancellationToken);
        return oldNotifications.Count;
    }
}