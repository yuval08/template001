import { BaseApiService } from '@/shared/api';
import type {
  Notification,
  GetNotificationsResponse,
  GetUnreadCountResponse,
  MarkAllAsReadResponse,
  CreateTestNotificationRequest,
  CreateTestNotificationResponse,
  NotificationPagination,
  NotificationFilters
} from '../types';

/**
 * Notification service handling all notification-related API operations
 * Extends BaseApiService for standard REST operations with notification-specific extensions
 */
export class NotificationService extends BaseApiService {
  protected readonly entityPath = '/api/notifications';

  /**
   * Get notifications with pagination and filters
   */
  async getNotifications(
    pagination: NotificationPagination,
    filters?: NotificationFilters
  ): Promise<GetNotificationsResponse> {
    const queryParams = this.buildNotificationQueryParams(pagination, filters);
    return this.get<GetNotificationsResponse>(this.entityPath, queryParams);
  }

  /**
   * Get unread notification count
   */
  async getUnreadCount(): Promise<number> {
    const response = await this.get<GetUnreadCountResponse>(`${this.entityPath}/unread-count`);
    return response.count;
  }

  /**
   * Mark notification as read
   */
  async markAsRead(notificationId: string): Promise<void> {
    return this.put<void>(`${this.entityPath}/${notificationId}/read`);
  }

  /**
   * Mark all notifications as read
   */
  async markAllAsRead(): Promise<number> {
    const response = await this.put<MarkAllAsReadResponse>(`${this.entityPath}/read-all`);
    return response.markedAsRead;
  }

  /**
   * Delete a notification
   */
  async deleteNotification(notificationId: string): Promise<void> {
    return this.delete<void>(`${this.entityPath}/${notificationId}`);
  }

  /**
   * Create test notification (development only)
   */
  async createTestNotification(
    data: CreateTestNotificationRequest
  ): Promise<string> {
    const response = await this.post<CreateTestNotificationResponse>(
      `${this.entityPath}/test`,
      data
    );
    return response.notificationId;
  }

  /**
   * Build query parameters for notification queries
   */
  private buildNotificationQueryParams(
    pagination: NotificationPagination,
    filters?: NotificationFilters
  ): Record<string, any> {
    const queryParams: Record<string, any> = {};

    // Pagination
    if (pagination.pageNumber !== undefined) {
      queryParams.pageNumber = pagination.pageNumber;
    }
    if (pagination.pageSize !== undefined) {
      queryParams.pageSize = pagination.pageSize;
    }

    // Filters
    if (filters?.isRead !== undefined) {
      queryParams.isRead = filters.isRead;
    }
    if (filters?.type !== undefined) {
      queryParams.type = filters.type;
    }

    return queryParams;
  }
}

// Export singleton instance for consistency with the application pattern
export const notificationService = new NotificationService();