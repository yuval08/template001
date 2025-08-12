import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
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

// API Response type
interface TestApiResponse {
  message: string;
  [key: string]: any;
}

// Test API Service
class TestApiService extends BaseApiService {
  async createTestNotification(data: any) {
    return this.post<TestApiResponse>('/api/test/notification', data);
  }

  async createBulkNotifications(count: number) {
    return this.post<TestApiResponse>('/api/test/notifications/bulk', { count });
  }

  async createErrorNotification() {
    return this.post<TestApiResponse>('/api/test/notification/error');
  }

  async createSuccessNotification() {
    return this.post<TestApiResponse>('/api/test/notification/success');
  }

  async createWarningNotification() {
    return this.post<TestApiResponse>('/api/test/notification/warning');
  }

  async testRealtimeNotification() {
    return this.post<TestApiResponse>('/api/test/notification/realtime');
  }

  async simulateJob() {
    return this.post<TestApiResponse>('/api/test/job/simulate');
  }

  async clearAllNotifications() {
    return this.delete<TestApiResponse>('/api/test/notifications/clear');
  }

  async getTestStats() {
    return this.get<any>('/api/test/stats');
  }
}

const testApi = new TestApiService();

export default function TestNotifications() {
  const { t } = useTranslation(['notifications', 'common']);
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
        title: t('notifications:test.toasts.created'), 
        description: result.message || `Test ${type} notification created` 
      });
    } catch (error) {
      toast.error({ 
        title: t('notifications:test.toasts.create_failed'), 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCustomNotification = async () => {
    if (!customTitle && !customMessage) {
      toast.error({ title: t('common:messages.error'), description: t('notifications:test.toasts.enter_title_or_message') });
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
        title: t('notifications:test.toasts.custom_created'), 
        description: result.message 
      });
      setCustomTitle('');
      setCustomMessage('');
    } catch (error) {
      toast.error({ 
        title: t('notifications:test.toasts.create_failed'), 
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
        title: t('notifications:test.toasts.bulk_created'), 
        description: result.message 
      });
    } catch (error) {
      toast.error({ 
        title: t('notifications:test.toasts.bulk_failed'), 
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
        title: t('notifications:test.toasts.realtime_test'), 
        description: result.message 
      });
    } catch (error) {
      toast.error({ 
        title: t('notifications:test.toasts.realtime_failed'), 
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
        title: t('notifications:test.toasts.job_started'), 
        description: result.message 
      });
    } catch (error) {
      toast.error({ 
        title: t('notifications:test.toasts.job_failed'), 
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
        title: t('notifications:test.toasts.cleared'), 
        description: result.message 
      });
    } catch (error) {
      toast.error({ 
        title: t('notifications:test.toasts.clear_failed'), 
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
        title: t('notifications:test.toasts.stats_retrieved'), 
        description: t('notifications:test.toasts.stats_updated') 
      });
    } catch (error) {
      toast.error({ 
        title: t('notifications:test.toasts.stats_failed'), 
        description: error instanceof Error ? error.message : 'Unknown error' 
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold mb-2">{t('notifications:test_title')}</h1>
        <p className="text-muted-foreground">{t('notifications:test_description')}</p>
      </div>
      
      <Tabs defaultValue="quick" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="quick">{t('notifications:test.tabs.quick')}</TabsTrigger>
          <TabsTrigger value="custom">{t('notifications:test.tabs.custom')}</TabsTrigger>
          <TabsTrigger value="advanced">{t('notifications:test.tabs.advanced')}</TabsTrigger>
          <TabsTrigger value="stats">{t('notifications:test.tabs.stats')}</TabsTrigger>
        </TabsList>
        
        <TabsContent value="quick">
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications:test.quick.title')}</CardTitle>
              <CardDescription>
                {t('notifications:test.quick.description')}
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
                  {t('notifications:test.quick.info')}
                </Button>
                
                <Button 
                  onClick={() => handleCreateNotification('success')}
                  variant="outline"
                  className="border-green-500 text-green-600 hover:bg-green-50"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('notifications:test.quick.success')}
                </Button>
                
                <Button 
                  onClick={() => handleCreateNotification('warning')}
                  variant="outline"
                  className="border-yellow-500 text-yellow-600 hover:bg-yellow-50"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('notifications:test.quick.warning')}
                </Button>
                
                <Button 
                  onClick={() => handleCreateNotification('error')}
                  variant="outline"
                  className="border-red-500 text-red-600 hover:bg-red-50"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('notifications:test.quick.error')}
                </Button>
              </div>
              
              <div className="flex gap-3 pt-4 border-t">
                <Button 
                  onClick={handleTestRealtime}
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('notifications:test.quick.realtime')}
                </Button>
                
                <Button 
                  onClick={handleSimulateJob}
                  variant="outline"
                  disabled={isLoading}
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('notifications:test.quick.simulate_job')}
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="custom">
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications:test.custom.title')}</CardTitle>
              <CardDescription>
                {t('notifications:test.custom.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="title">{t('notifications:test.custom.title_label')}</Label>
                <Input 
                  id="title"
                  placeholder={t('notifications:test.custom.title_placeholder')}
                  value={customTitle}
                  onChange={(e) => setCustomTitle(e.target.value)}
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="message">{t('notifications:test.custom.message_label')}</Label>
                <Textarea 
                  id="message"
                  placeholder={t('notifications:test.custom.message_placeholder')}
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
                {t('notifications:test.custom.create')}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="advanced">
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications:test.advanced.title')}</CardTitle>
              <CardDescription>
                {t('notifications:test.advanced.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="bulk-count">{t('notifications:test.advanced.bulk_count')}</Label>
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
                    {t('notifications:test.advanced.create_bulk', { count: bulkCount })}
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground">{t('notifications:test.advanced.bulk_limit')}</p>
              </div>
              
              <div className="pt-4 border-t">
                <Button 
                  onClick={handleClearAll}
                  variant="destructive"
                  disabled={isLoading}
                  className="w-full"
                >
                  {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t('notifications:test.advanced.clear_all')}
                </Button>
                <p className="text-xs text-muted-foreground mt-2">
                  {t('notifications:test.advanced.clear_warning')}
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="stats">
          <Card>
            <CardHeader>
              <CardTitle>{t('notifications:test.stats.title')}</CardTitle>
              <CardDescription>
                {t('notifications:test.stats.description')}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Button 
                onClick={handleGetStats}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {t('notifications:test.stats.refresh')}
              </Button>
              
              {stats && (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-gray-50 dark:bg-gray-900 rounded-lg">
                      <p className="text-sm text-muted-foreground">{t('notifications:test.stats.total')}</p>
                      <p className="text-2xl font-bold">{stats.total}</p>
                    </div>
                    <div className="p-4 bg-blue-50 dark:bg-blue-950 rounded-lg">
                      <p className="text-sm text-muted-foreground">{t('notifications:test.stats.unread')}</p>
                      <p className="text-2xl font-bold text-blue-600">{stats.unread}</p>
                    </div>
                  </div>
                  
                  {stats.byType && stats.byType.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-2">{t('notifications:test.stats.by_type')}</p>
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
          <CardTitle>{t('notifications:test.guide.title')}</CardTitle>
        </CardHeader>
        <CardContent>
          <ol className="list-decimal list-inside space-y-2 text-sm text-gray-600 dark:text-gray-400">
            <li>{t('notifications:test.guide.step1')}</li>
            <li>{t('notifications:test.guide.step2')}</li>
            <li>{t('notifications:test.guide.step3')}</li>
            <li>{t('notifications:test.guide.step4')}</li>
            <li>{t('notifications:test.guide.step5')}</li>
            <li>{t('notifications:test.guide.step6')}</li>
            <li>{t('notifications:test.guide.step7')}</li>
            <li>{t('notifications:test.guide.step8')}</li>
          </ol>
        </CardContent>
      </Card>
    </div>
  );
}