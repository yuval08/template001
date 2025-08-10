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
  Info = 1,
  Success = 2,
  Warning = 3,
  Error = 4
}

export interface NotificationFilters {
  isRead?: boolean;
  type?: NotificationType;
}

export interface NotificationPagination {
  pageNumber: number;
  pageSize: number;
}