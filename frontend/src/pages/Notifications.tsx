import React, { useState } from 'react';
import { format } from 'date-fns';
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
  Filter,
  RefreshCw,
  Inbox
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { cn } from '@/utils/cn';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { useNotifications, NotificationType } from '@/entities/notification';

type NotificationTypeFilter = 'all' | 'info' | 'success' | 'warning' | 'error';
type NotificationReadFilter = 'all' | 'unread' | 'read';

export default function Notifications() {
  const navigate = useNavigate();
  const [typeFilter, setTypeFilter] = useState<NotificationTypeFilter>('all');
  const [readFilter, setReadFilter] = useState<NotificationReadFilter>('all');
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [bulkDeleteDialogOpen, setBulkDeleteDialogOpen] = useState(false);
  const [notificationToDelete, setNotificationToDelete] = useState<string | null>(null);
  
  // Convert string filter to enum value
  const getTypeEnumValue = (type: NotificationTypeFilter): NotificationType | undefined => {
    switch (type) {
      case 'info': return NotificationType.Info;
      case 'success': return NotificationType.Success;
      case 'warning': return NotificationType.Warning;
      case 'error': return NotificationType.Error;
      default: return undefined;
    }
  };
  
  const filters = {
    type: getTypeEnumValue(typeFilter),
    isRead: readFilter === 'all' ? undefined : readFilter === 'read'
  };
  
  const {
    notifications,
    unreadCount,
    isLoading,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    refetch,
    isMarkingAsRead,
    isMarkingAllAsRead,
    isDeleting
  } = useNotifications({ pageNumber: 1, pageSize: 50 }, filters);

  const getNotificationIcon = (type: number | string) => {
    // Handle both numeric and string types for compatibility
    const typeNum = typeof type === 'string' ? 
      (type === 'success' ? 1 : type === 'warning' ? 2 : type === 'error' ? 3 : 0) : 
      type;
    
    switch (typeNum) {
      case 1: // Success
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 3: // Error
        return <XCircle className="h-5 w-5 text-red-500" />;
      case 2: // Warning
        return <AlertCircle className="h-5 w-5 text-yellow-500" />;
      case 0: // Info
      default:
        return <Info className="h-5 w-5 text-blue-500" />;
    }
  };

  const getNotificationBadge = (type: number | string) => {
    // Handle both numeric and string types for compatibility
    const typeNum = typeof type === 'string' ? 
      (type === 'success' ? 1 : type === 'warning' ? 2 : type === 'error' ? 3 : 0) : 
      type;
    
    switch (typeNum) {
      case 1: // Success
        return <Badge className="bg-green-100 text-green-800">Success</Badge>;
      case 3: // Error
        return <Badge className="bg-red-100 text-red-800">Error</Badge>;
      case 2: // Warning
        return <Badge className="bg-yellow-100 text-yellow-800">Warning</Badge>;
      case 0: // Info
      default:
        return <Badge className="bg-blue-100 text-blue-800">Info</Badge>;
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
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to mark all notifications as read:', error);
    }
  };

  const handleDeleteClick = (id: string) => {
    setNotificationToDelete(id);
    setDeleteDialogOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (notificationToDelete) {
      try {
        await deleteNotification(notificationToDelete);
        setSelectedIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(notificationToDelete);
          return newSet;
        });
      } catch (error) {
        console.error('Failed to delete notification:', error);
      } finally {
        setNotificationToDelete(null);
        setDeleteDialogOpen(false);
      }
    }
  };

  const handleDeleteSelectedClick = () => {
    setBulkDeleteDialogOpen(true);
  };

  const handleConfirmBulkDelete = async () => {
    try {
      for (const id of selectedIds) {
        await deleteNotification(id);
      }
      setSelectedIds(new Set());
    } catch (error) {
      console.error('Failed to delete selected notifications:', error);
    } finally {
      setBulkDeleteDialogOpen(false);
    }
  };

  const handleSelectAll = () => {
    if (selectedIds.size === notifications.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(notifications.map(n => n.id)));
    }
  };

  const handleSelectOne = (id: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) {
        newSet.delete(id);
      } else {
        newSet.add(id);
      }
      return newSet;
    });
  };

  const handleViewDetails = (notification: any) => {
    if (!notification.isRead) {
      handleMarkAsRead(notification.id);
    }
    if (notification.actionUrl) {
      if (notification.actionUrl.startsWith('http')) {
        window.open(notification.actionUrl, '_blank');
      } else {
        navigate(notification.actionUrl);
      }
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-muted-foreground">
            {unreadCount > 0 ? `You have ${unreadCount} unread notification${unreadCount === 1 ? '' : 's'}` : 'All caught up!'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => refetch()}
            disabled={isLoading}
          >
            <RefreshCw className={cn("h-4 w-4 mr-2", isLoading && "animate-spin")} />
            Refresh
          </Button>
        </div>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Select value={typeFilter} onValueChange={(value: NotificationTypeFilter) => setTypeFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="Filter by type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="info">Info</SelectItem>
                  <SelectItem value="success">Success</SelectItem>
                  <SelectItem value="warning">Warning</SelectItem>
                  <SelectItem value="error">Error</SelectItem>
                </SelectContent>
              </Select>
              
              <Select value={readFilter} onValueChange={(value: NotificationReadFilter) => setReadFilter(value)}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Filter by status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All</SelectItem>
                  <SelectItem value="unread">Unread</SelectItem>
                  <SelectItem value="read">Read</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center gap-2">
              {selectedIds.size > 0 && (
                <>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleDeleteSelectedClick}
                    disabled={isDeleting}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Delete Selected ({selectedIds.size})
                  </Button>
                  <Separator orientation="vertical" className="h-6" />
                </>
              )}
              
              {unreadCount > 0 && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleMarkAllAsRead}
                  disabled={isMarkingAllAsRead}
                >
                  <CheckCheck className="h-4 w-4 mr-2" />
                  Mark All as Read
                </Button>
              )}
            </div>
          </div>
        </CardHeader>
        
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-64 text-gray-500">
              <Inbox className="h-12 w-12 mb-4" />
              <p className="text-lg font-medium">No notifications</p>
              <p className="text-sm text-muted-foreground">You're all caught up!</p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.length > 0 && (
                <div className="px-6 py-3 bg-gray-50 dark:bg-gray-900 flex items-center gap-3">
                  <Checkbox
                    checked={selectedIds.size === notifications.length && notifications.length > 0}
                    onCheckedChange={handleSelectAll}
                  />
                  <span className="text-sm text-muted-foreground">
                    Select all ({notifications.length})
                  </span>
                </div>
              )}
              
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={cn(
                    "px-6 py-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer",
                    !notification.isRead && "bg-blue-50 dark:bg-blue-950/20"
                  )}
                  onClick={() => handleViewDetails(notification)}
                >
                  <div className="flex items-center gap-4">
                    <Checkbox
                      checked={selectedIds.has(notification.id)}
                      onCheckedChange={() => handleSelectOne(notification.id)}
                      onClick={(e) => e.stopPropagation()}
                    />
                    
                    <div>
                      {getNotificationIcon(notification.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <p className={cn(
                          "text-base",
                          !notification.isRead && "font-semibold"
                        )}>
                          {notification.title}
                        </p>
                        {getNotificationBadge(notification.type)}
                      </div>
                      
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        {notification.message}
                      </p>
                      
                      <div className="flex items-center gap-4 mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-500">
                          {format(new Date(notification.createdAt), 'PPpp')}
                        </p>
                        
                        {notification.actionUrl && (
                          <Button
                            variant="link"
                            size="sm"
                            className="p-0 h-auto text-xs text-blue-600 dark:text-blue-400"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleViewDetails(notification);
                            }}
                          >
                            View details →
                          </Button>
                        )}
                      </div>
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
                          disabled={isMarkingAsRead}
                          className="h-8 w-8 p-0"
                          title="Mark as read"
                        >
                          <Check className="h-4 w-4" />
                        </Button>
                      )}
                      
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteClick(notification.id);
                        }}
                        disabled={isDeleting}
                        className="h-8 w-8 p-0 text-gray-500 hover:text-red-500"
                        title="Delete notification"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Notification</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this notification? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNotificationToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmDelete}>
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={bulkDeleteDialogOpen} onOpenChange={setBulkDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Selected Notifications</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete {selectedIds.size} selected notification{selectedIds.size === 1 ? '' : 's'}? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleConfirmBulkDelete}>
              Delete {selectedIds.size} Notification{selectedIds.size === 1 ? '' : 's'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}