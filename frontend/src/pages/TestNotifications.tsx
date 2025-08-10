import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from '@/stores/toastStore';
import { BaseApiService } from '@/shared/api';
import { Loader2 } from 'lucide-react';

// Test API Service
class TestApiService extends BaseApiService {
  async createTestNotification(data: any) {
    return this.post('/api/test/notification', data);
  }

  async createBulkNotifications(count: number) {
    return this.post('/api/test/notifications/bulk', { count });
  }

  async createErrorNotification() {
    return this.post('/api/test/notification/error');
  }

  async createSuccessNotification() {
    return this.post('/api/test/notification/success');
  }

  async createWarningNotification() {
    return this.post('/api/test/notification/warning');
  }

  async testRealtimeNotification() {
    return this.post('/api/test/notification/realtime');
  }

  async simulateJob() {
    return this.post('/api/test/job/simulate');
  }

  async clearAllNotifications() {
    return this.delete('/api/test/notifications/clear');
  }

  async getTestStats() {
    return this.get('/api/test/stats');
  }
}

const testApi = new TestApiService();

export default function TestNotifications() {
  const [isLoading, setIsLoading] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [bulkCount, setBulkCount] = useState(5);
  const [stats, setStats] = useState<any>(null);

  const handleCreateNotification = async (type: 'info' | 'success' | 'warning' | 'error') => {
    setIsLoading(true);
    try {
      let result;
      switch(type) {
        case 'success':
          result = await testApi.createSuccessNotification();
          break;
        case 'warning':
          result = await testApi.createWarningNotification();
          break;
        case 'error':
          result = await testApi.createErrorNotification();
          break;
        case 'info':
        default:
          result = await testApi.createTestNotification({ 
            type: 0, // Info
            title: 'Test Info Notification',
            message: `This is a test info notification created at ${new Date().toLocaleTimeString()}`
          });
          break;
      }
      
      toast.success({ 
        title: 'Notification created', 
        description: result.message || `Test ${type} notification created` 
      });
    } catch (error) {
      toast.error({ 
        title: 'Failed to create notification', 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCustomNotification = async () => {
    if (!customTitle && !customMessage) {
      toast.error({ title: 'Error', description: 'Please enter a title or message' });
      return;
    }
    
    setIsLoading(true);
    try {
      const result = await testApi.createTestNotification({
        title: customTitle || 'Custom Notification',
        message: customMessage || 'Custom message',
        type: 0, // Info
        actionUrl: '/dashboard'
      });
      toast.success({ 
        title: 'Custom notification created', 
        description: result.message 
      });
      setCustomTitle('');
      setCustomMessage('');
    } catch (error) {
      toast.error({ 
        title: 'Failed to create notification', 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateBulkNotifications = async () => {
    setIsLoading(true);
    try {
      const result = await testApi.createBulkNotifications(bulkCount);
      toast.success({ 
        title: 'Bulk notifications created', 
        description: result.message 
      });
    } catch (error) {
      toast.error({ 
        title: 'Failed to create bulk notifications', 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleTestRealtime = async () => {
    setIsLoading(true);
    try {
      const result = await testApi.testRealtimeNotification();
      toast.success({ 
        title: 'Real-time test', 
        description: result.message 
      });
    } catch (error) {
      toast.error({ 
        title: 'Failed to test real-time', 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateJob = async () => {
    setIsLoading(true);
    try {
      const result = await testApi.simulateJob();
      toast.success({ 
        title: 'Job simulation started', 
        description: result.message 
      });
    } catch (error) {
      toast.error({ 
        title: 'Failed to simulate job', 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearAll = async () => {
    setIsLoading(true);
    try {
      const result = await testApi.clearAllNotifications();
      toast.success({ 
        title: 'Notifications cleared', 
        description: result.message 
      });
    } catch (error) {
      toast.error({ 
        title: 'Failed to clear notifications', 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetStats = async () => {
    setIsLoading(true);
    try {
      const result = await testApi.getTestStats();
      setStats(result);
      toast.success({ 
        title: 'Stats retrieved', 
        description: 'Statistics updated' 
      });
    } catch (error) {
      toast.error({ 
        title: 'Failed to get stats', 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">Test Notifications</h1>
        <p className="text-muted-foreground">Development tools for testing the notification system</p>
      </div>
      
      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick">Quick Tests</TabsTrigger>
          <TabsTrigger value="custom">Custom</TabsTrigger>
          <TabsTrigger value="advanced">Advanced</TabsTrigger>
          <TabsTrigger value="stats">Statistics</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quick">
          <Card>
            <CardHeader>
              <CardTitle>Quick Test Notifications</CardTitle>
              <CardDescription>
                Create test notifications of different types
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <Button 
                  onClick={() => handleCreateNotification('info')}
                  variant="outline"
                  className="border-blue-500 text-blue-600 hover:bg-blue-50"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Info Notification
                </Button>
                
                <Button 
                  onClick={() => handleCreateNotification('success')}
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Success Notification
                </Button>
                
                <Button 
                  onClick={() => handleCreateNotification('warning')}
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Warning Notification
                </Button>
                
                <Button 
                  onClick={() => handleCreateNotification('error')}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Error Notification
                </Button>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={handleTestRealtime}
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Test Real-time
                </Button>
                
                <Button 
                  onClick={handleSimulateJob}
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Simulate Long Job
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>Custom Notification</CardTitle>
              <CardDescription>
                Create a notification with custom title and message
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">Title</Label>
                <Input 
                  id="title"
                  placeholder="Enter notification title"
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">Message</Label>
                <Textarea 
                  id="message"
                  placeholder="Enter notification message"
                  value={customMessage}
                  onChange={(e) => setCustomMessage(e.target.value)}
                  rows={4}
                />
              </div>
              
              <Button 
                onClick={handleCreateCustomNotification}
                disabled={isLoading || (!customTitle && !customMessage)}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Create Custom Notification
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>Advanced Testing</CardTitle>
              <CardDescription>
                Bulk operations and system testing
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-count">Bulk Count</Label>
                <div className="flex gap-2">
                  <Input 
                    id="bulk-count"
                    type="number"
                    min="1"
                    max="20"
                    value={bulkCount}
                    onChange={(e) => setBulkCount(parseInt(e.target.value) || 5)}
                    className="max-w-[120px]"
                  />
                  <Button 
                    onClick={handleCreateBulkNotifications}
                    disabled={isLoading}
                  >
                    {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create {bulkCount} Notifications
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">Maximum 20 notifications at once</p>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleClearAll}
                  variant="destructive"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Clear All Notifications
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  This will delete all your notifications permanently
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>Notification Statistics</CardTitle>
              <CardDescription>
                View your notification statistics
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGetStats}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                Refresh Statistics
              </Button>
              
              {stats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm text-muted-foreground">Total Notifications</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm text-muted-foreground">Unread</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                    </div>
                  </div>
                  
                  {stats.byType && stats.byType.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">By Type</p>
                      <div className="space-y-2">
                        {stats.byType.map((item: any) => (
                          <div key={item.Type} className="flex justify-between items-center">
                            <Badge variant="outline">{item.Type}</Badge>
                            <span className="text-sm font-medium">{item.Count}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Card>
        <CardHeader>
          <CardTitle>Testing Guide</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>Use Quick Tests to create notifications of different types</li>
            <li>Check the bell icon in the header to see notifications in the inbox</li>
            <li>Navigate to the Notifications page to see all notifications</li>
            <li>Test real-time updates with the Real-time button</li>
            <li>Simulate a long-running job to see progress notifications</li>
            <li>Use bulk operations to test performance with many notifications</li>
            <li>Test marking as read, deleting, and bulk actions</li>
            <li>Clear all notifications when done testing</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}