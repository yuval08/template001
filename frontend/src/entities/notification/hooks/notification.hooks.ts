import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { notificationService } from '../services';
import { useNotificationStore } from '@/stores/core/notification.store';
import { useAuth } from '@/hooks/useAuth';
import type {
  NotificationPagination,
  NotificationFilters,
  CreateTestNotificationRequest
} from '../types';

const NOTIFICATION_QUERY_KEY = 'notifications';
const UNREAD_COUNT_QUERY_KEY = 'notifications-unread-count';

export const useNotifications = (
  pagination: NotificationPagination = { pageNumber: 1, pageSize: 20 },
  filters?: NotificationFilters
) => {
  const queryClient = useQueryClient();
  const { isAuthenticated } = useAuth();
  const setPersistentItems = useNotificationStore((state) => state.setPersistentItems);
  const [unreadCount, setUnreadCount] = useState(0);

  // Fetch notifications
  const {
    data,
    isLoading,
    error,
    refetch
  } = useQuery({
    queryKey: [NOTIFICATION_QUERY_KEY, pagination, filters],
    queryFn: () => notificationService.getNotifications(pagination, filters),
    enabled: isAuthenticated, // Only run when authenticated
    refetchInterval: 30000, // Refetch every 30 seconds
  });

  // Fetch unread count
  const { data: unreadData } = useQuery({
    queryKey: [UNREAD_COUNT_QUERY_KEY],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: isAuthenticated, // Only run when authenticated
    refetchInterval: 30000,
  });

  // Update persistent items in store when data changes
  useEffect(() => {
    if (data?.notifications) {
      setPersistentItems(data.notifications as any);
    }
  }, [data, setPersistentItems]);

  // Update unread count
  useEffect(() => {
    setUnreadCount(unreadData ?? data?.totalUnread ?? 0);
  }, [data, unreadData]);

  // Mark as read mutation
  const markAsReadMutation = useMutation({
    mutationFn: notificationService.markAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
    },
  });

  // Mark all as read mutation
  const markAllAsReadMutation = useMutation({
    mutationFn: notificationService.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
    },
  });

  // Delete notification mutation
  const deleteNotificationMutation = useMutation({
    mutationFn: notificationService.deleteNotification,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
    },
  });

  return {
    notifications: data?.notifications ?? [],
    unreadCount,
    totalUnread: data?.totalUnread ?? 0,
    pageNumber: data?.pageNumber ?? pagination.pageNumber,
    pageSize: data?.pageSize ?? pagination.pageSize,
    isLoading,
    error,
    refetch,
    markAsRead: markAsReadMutation.mutateAsync,
    markAllAsRead: markAllAsReadMutation.mutateAsync,
    deleteNotification: deleteNotificationMutation.mutateAsync,
    isMarkingAsRead: markAsReadMutation.isPending,
    isMarkingAllAsRead: markAllAsReadMutation.isPending,
    isDeleting: deleteNotificationMutation.isPending,
  };
};

export const useCreateTestNotification = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateTestNotificationRequest) =>
      notificationService.createTestNotification(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [NOTIFICATION_QUERY_KEY] });
      queryClient.invalidateQueries({ queryKey: [UNREAD_COUNT_QUERY_KEY] });
    },
  });
};

export const useUnreadNotificationCount = () => {
  const { isAuthenticated } = useAuth();
  const { data, isLoading } = useQuery({
    queryKey: [UNREAD_COUNT_QUERY_KEY],
    queryFn: () => notificationService.getUnreadCount(),
    enabled: isAuthenticated, // Only run when authenticated
    refetchInterval: 30000,
  });

  return {
    count: data ?? 0,
    isLoading,
  };
};