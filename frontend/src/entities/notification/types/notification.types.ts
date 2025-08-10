export interface Notification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  isRead: boolean;
  readAt?: string;
  actionUrl?: string;
  metadata?: string;
  createdAt: string;
  updatedAt?: string;
}

export enum NotificationType {
  Info = 0,
  Success = 1,
  Warning = 2,
  Error = 3
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: NotificationType;
}

export interface NotificationPagination {
  pageNumber: number;
  pageSize: number;
}