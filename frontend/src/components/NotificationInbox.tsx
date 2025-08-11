import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Bell,
  Check,
  CheckCheck,
  Trash2,
  Info,
  AlertCircle,
  CheckCircle,
  XCircle,
  Loader2,
  Inbox
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns/formatDistanceToNow';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { DeleteConfirmationDialog } from '@/components/DeleteConfirmationDialog';
import { useNotifications } from '@/entities/notification';
import { useAuth } from '@/hooks/useAuth';

interface NotificationInboxProps {
  className?: string;
}

export const NotificationInbox: React.FC<NotificationInboxProps> = ({ className }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification
  } = useNotifications();

  const getNotificationIcon = (type: number | string) => {
    // Handle both numeric and string types for compatibility
    const typeNum = typeof type === 'string' ? 
      (type === 'success' ? 1 : type === 'warning' ? 2 : type === 'error' ? 3 : 0) : 
      type;
    
    switch (typeNum) {
      case 1: // Success
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 3: // Error
        return <XCircle className="h-4 w-4 text-red-500" />;
      case 2: // Warning
        return <AlertCircle className="h-4 w-4 text-yellow-500" />;
      case 0: // Info
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const handleMarkAsRead = async (id: string) => {
    try {
      await markAsRead(id);
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await markAllAsRead();
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotificationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (notificationToDelete) {
      try {
        await deleteNotification(notificationToDelete);
      } catch (error) {
        console.error('Failed to delete notification:', error);
      } finally {
        setNotificationToDelete(null);
        setDeleteDialogOpen(false);
      }
    }
  };

  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    // Don't refetch on every open - React Query will handle staleness
    // Only refetch if data is older than staleTime (30 seconds)
  };

  // Don't render the notification bell if not authenticated
  if (!isAuthenticated) {
    return null;
  }

  return (
    <>
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          className={cn("p-2 relative", className)}
        >
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
              {unreadCount > 99 ? '99+' : unreadCount}
            </span>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-96 p-0" align="end">
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={handleMarkAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-4 w-4 mr-1" />
              Mark all as read
            </Button>
          )}
        </div>

        <ScrollArea className="h-[400px]">
          {isLoading ? (
            <div className="flex items-center justify-center h-32">
              <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-32 text-gray-500">
              <Inbox className="h-8 w-8 mb-2" />
              <p className="text-sm">No notifications</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors",
                    !notification.isRead && "bg-blue-50 dark:bg-blue-950/20"
                  )}
                >
                  <div className="flex items-start gap-3">
                    <div className="mt-1">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={cn(
                        "text-sm",
                        !notification.isRead && "font-semibold"
                      )}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                        {notification.message}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-500 mt-2">
                        {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true })}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {!notification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleMarkAsRead(notification.id);
                          }}
                          className="h-8 w-8 p-0"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => handleDeleteClick(notification.id, e)}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                  {notification.actionUrl && (
                    <Button
                      variant="link"
                      size="sm"
                      className="mt-2 p-0 h-auto text-blue-600 dark:text-blue-400"
                      onClick={(e) => {
                        e.stopPropagation();
                        if (!notification.isRead) {
                          handleMarkAsRead(notification.id);
                        }
                        // Handle both internal and external URLs
                        if (notification.actionUrl!.startsWith('http')) {
                          window.open(notification.actionUrl!, '_blank');
                        } else {
                          setIsOpen(false);
                          navigate(notification.actionUrl!);
                        }
                      }}
                    >
                      View details →
                    </Button>
                  )}
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {notifications.length > 0 && (
          <>
            <Separator />
            <div className="p-3">
              <Button
                variant="ghost"
                size="sm"
                className="w-full text-sm"
                onClick={() => {
                  setIsOpen(false);
                  navigate('/notifications');
                }}
              >
                View all notifications
              </Button>
            </div>
          </>
        )}
      </PopoverContent>
    </Popover>

    <DeleteConfirmationDialog
      open={deleteDialogOpen}
      onOpenChange={setDeleteDialogOpen}
      onConfirm={handleConfirmDelete}
      onCancel={() => setNotificationToDelete(null)}
      title="Delete Notification"
      description="Are you sure you want to delete this notification? This action cannot be undone."
      confirmText="Delete"
    />
    </>
  );
};