import { Notification } from './notification.types';

export interface GetNotificationsResponse {
  notifications: Notification[];
  totalUnread: number;
  pageNumber: number;
  pageSize: number;
}

export interface GetUnreadCountResponse {
  count: number;
}

export interface MarkAllAsReadResponse {
  markedAsRead: number;
}

export interface CreateTestNotificationRequest {
  title?: string;
  message?: string;
  type?: string;
  actionUrl?: string;
  metadata?: string;
}

export interface CreateTestNotificationResponse {
  notificationId: string;
}