import { z } from 'zod';
import { NotificationType } from '../types';

export const NotificationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  message: z.string().min(1).max(1000),
  type: z.nativeEnum(NotificationType),
  isRead: z.boolean(),
  readAt: z.string().optional(),
  actionUrl: z.string().url().optional(),
  metadata: z.string().optional(),
  createdAt: z.string(),
  updatedAt: z.string().optional(),
});

export const GetNotificationsResponseSchema = z.object({
  notifications: z.array(NotificationSchema),
  totalUnread: z.number(),
  pageNumber: z.number(),
  pageSize: z.number(),
});

export const MarkNotificationAsReadSchema = z.object({
  notificationId: z.string().uuid(),
});

export const DeleteNotificationSchema = z.object({
  notificationId: z.string().uuid(),
});

export type NotificationDto = z.infer<typeof NotificationSchema>;
export type GetNotificationsResponseDto = z.infer<typeof GetNotificationsResponseSchema>;