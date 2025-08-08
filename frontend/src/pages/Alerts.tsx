import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { toast, useToastStore } from '@/stores/toastStore';
import { 
  AlertTriangle, 
  CheckCircle, 
  Info, 
  X, 
  XCircle,
  AlertCircle,
  Trash2,
  Download,
  Settings,
  Bell,
  Zap
} from 'lucide-react';

const Alerts: React.FC = () => {
  const [dismissibleAlerts, setDismissibleAlerts] = useState({
    info: true,
    warning: true,
    error: true,
    success: true,
  });

  const toastStore = useToastStore();

  const handleDismissAlert = (type: keyof typeof dismissibleAlerts) => {
    setDismissibleAlerts(prev => ({
      ...prev,
      [type]: false
    }));
  };

  const resetAlerts = () => {
    setDismissibleAlerts({
      info: true,
      warning: true,
      error: true,
      success: true,
    });
  };

  const showToastAtPosition = (_position: string, type: 'success' | 'error' | 'warning' | 'info') => {
    const messages = {
      success: 'Operation completed successfully!',
      error: 'An error occurred',
      warning: 'Please check your input',
      info: 'Here is some information'
    };
    
    toast[type](`${type.charAt(0).toUpperCase() + type.slice(1)} Toast`, messages[type]);
  };

  const showToastWithAction = () => {
    // Since the toast store doesn't support actions, we'll simulate it
    toast.info('Download Ready', 'Click the button below to download your file.');
    
    // Add download button after a short delay
    setTimeout(() => {
      const downloadBtn = document.createElement('button');
      downloadBtn.textContent = 'Download';
      downloadBtn.className = 'mt-2 px-3 py-1 bg-primary text-white rounded text-sm';
      downloadBtn.onclick = () => {
        toast.success('Download started!');
      };
    }, 100);
  };

  const CodeBlock: React.FC<{ children: React.ReactNode }> = ({ children }) => (
    <pre className="bg-gray-100 dark:bg-gray-800 p-3 rounded text-sm overflow-x-auto">
      <code>{children}</code>
    </pre>
  );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Alerts & Notifications Showcase
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Comprehensive examples of alert components, toast notifications, and user feedback patterns using Shadcn/ui components.
        </p>
      </div>

      {/* Alert Variants */}
      <Card>
        <CardHeader>
          <CardTitle>Alert Variants</CardTitle>
          <CardDescription>
            Different alert styles for various message types and severity levels.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Info className="h-4 w-4" />
            <AlertTitle>Information</AlertTitle>
            <AlertDescription>
              This is a default information alert. Use it for general information that users should be aware of.
            </AlertDescription>
          </Alert>

          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Success</AlertTitle>
            <AlertDescription>
              This is a success alert. Use it to confirm that an action has been completed successfully.
            </AlertDescription>
          </Alert>

          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Warning</AlertTitle>
            <AlertDescription>
              This is a warning alert. Use it to draw attention to important information or potential issues.
            </AlertDescription>
          </Alert>

          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>
              This is an error alert. Use it to communicate errors or critical issues that need immediate attention.
            </AlertDescription>
          </Alert>

          <CodeBlock>
{`<Alert>
  <Info className="h-4 w-4" />
  <AlertTitle>Information</AlertTitle>
  <AlertDescription>
    This is a default information alert.
  </AlertDescription>
</Alert>

<Alert variant="success">
  <CheckCircle className="h-4 w-4" />
  <AlertTitle>Success</AlertTitle>
  <AlertDescription>
    This is a success alert.
  </AlertDescription>
</Alert>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Dismissible Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Dismissible Alerts</CardTitle>
          <CardDescription>
            Alerts that can be dismissed by users with close buttons.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {dismissibleAlerts.info && (
            <Alert className="relative pr-12">
              <Info className="h-4 w-4" />
              <AlertTitle>System Maintenance</AlertTitle>
              <AlertDescription>
                We'll be performing maintenance on Sunday from 2-4 AM EST. Some services may be temporarily unavailable.
              </AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={() => handleDismissAlert('info')}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}

          {dismissibleAlerts.warning && (
            <Alert variant="warning" className="relative pr-12">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Storage Almost Full</AlertTitle>
              <AlertDescription>
                Your storage is 85% full. Consider cleaning up old files or upgrading your plan.
              </AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={() => handleDismissAlert('warning')}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}

          {dismissibleAlerts.error && (
            <Alert variant="destructive" className="relative pr-12">
              <XCircle className="h-4 w-4" />
              <AlertTitle>Connection Failed</AlertTitle>
              <AlertDescription>
                Unable to connect to the server. Please check your internet connection and try again.
              </AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={() => handleDismissAlert('error')}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}

          {dismissibleAlerts.success && (
            <Alert variant="success" className="relative pr-12">
              <CheckCircle className="h-4 w-4" />
              <AlertTitle>Data Exported Successfully</AlertTitle>
              <AlertDescription>
                Your data has been exported and is ready for download. The export will be available for 24 hours.
              </AlertDescription>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-2 top-2 h-8 w-8"
                onClick={() => handleDismissAlert('success')}
              >
                <X className="h-4 w-4" />
              </Button>
            </Alert>
          )}

          <div className="flex gap-2">
            <Button onClick={resetAlerts} variant="outline" size="sm">
              Reset All Alerts
            </Button>
          </div>

          <CodeBlock>
{`<Alert className="relative pr-12">
  <Info className="h-4 w-4" />
  <AlertTitle>System Maintenance</AlertTitle>
  <AlertDescription>
    We'll be performing maintenance...
  </AlertDescription>
  <Button
    variant="ghost"
    size="icon"
    className="absolute right-2 top-2 h-8 w-8"
    onClick={handleDismiss}
  >
    <X className="h-4 w-4" />
  </Button>
</Alert>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Alerts with Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Alerts with Actions</CardTitle>
          <CardDescription>
            Alerts that include action buttons for user interaction.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertTitle>Update Available</AlertTitle>
            <AlertDescription>
              A new version of the application is available. Update now to get the latest features and security improvements.
            </AlertDescription>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => toast.success('Update started!')}>
                Update Now
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info('Update scheduled for later')}>
                Later
              </Button>
            </div>
          </Alert>

          <Alert variant="warning">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Unsaved Changes</AlertTitle>
            <AlertDescription>
              You have unsaved changes that will be lost if you leave this page.
            </AlertDescription>
            <div className="flex gap-2 mt-4">
              <Button size="sm" onClick={() => toast.success('Changes saved!')}>
                Save Changes
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.warning('Changes discarded')}>
                Discard
              </Button>
            </div>
          </Alert>

          <Alert variant="destructive">
            <Trash2 className="h-4 w-4" />
            <AlertTitle>Confirm Deletion</AlertTitle>
            <AlertDescription>
              This action cannot be undone. The selected items will be permanently deleted.
            </AlertDescription>
            <div className="flex gap-2 mt-4">
              <Button variant="destructive" size="sm" onClick={() => toast.error('Items deleted')}>
                Delete Permanently
              </Button>
              <Button variant="outline" size="sm" onClick={() => toast.info('Deletion cancelled')}>
                Cancel
              </Button>
            </div>
          </Alert>

          <CodeBlock>
{`<Alert>
  <AlertCircle className="h-4 w-4" />
  <AlertTitle>Update Available</AlertTitle>
  <AlertDescription>
    A new version is available...
  </AlertDescription>
  <div className="flex gap-2 mt-4">
    <Button size="sm">Update Now</Button>
    <Button variant="outline" size="sm">Later</Button>
  </div>
</Alert>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Toast Notifications */}
      <Card>
        <CardHeader>
          <CardTitle>Toast Notifications</CardTitle>
          <CardDescription>
            Temporary notification messages that appear and auto-dismiss.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <Button 
              variant="outline"
              onClick={() => showToastAtPosition('top-right', 'success')}
            >
              <CheckCircle className="mr-2 h-4 w-4" />
              Success Toast
            </Button>
            <Button 
              variant="outline"
              onClick={() => showToastAtPosition('top-right', 'error')}
            >
              <XCircle className="mr-2 h-4 w-4" />
              Error Toast
            </Button>
            <Button 
              variant="outline"
              onClick={() => showToastAtPosition('top-right', 'warning')}
            >
              <AlertTriangle className="mr-2 h-4 w-4" />
              Warning Toast
            </Button>
            <Button 
              variant="outline"
              onClick={() => showToastAtPosition('top-right', 'info')}
            >
              <Info className="mr-2 h-4 w-4" />
              Info Toast
            </Button>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Toast with Rich Content</h4>
            <div className="flex gap-3">
              <Button onClick={() => {
                toast.success('File Upload Complete', 'Your presentation.pdf has been uploaded successfully and is now available in your documents.');
              }}>
                <Download className="mr-2 h-4 w-4" />
                Upload Success
              </Button>
              <Button onClick={() => {
                toast.error('Network Error', 'Unable to connect to the server. Please check your internet connection and try again in a few moments.');
              }}>
                <XCircle className="mr-2 h-4 w-4" />
                Network Error
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Interactive Toasts</h4>
            <div className="flex gap-3">
              <Button onClick={showToastWithAction}>
                <Bell className="mr-2 h-4 w-4" />
                Toast with Action
              </Button>
              <Button onClick={() => {
                toast.info('Settings Updated', 'Your notification preferences have been updated successfully.');
              }}>
                <Settings className="mr-2 h-4 w-4" />
                Settings Toast
              </Button>
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-sm font-medium">Active Toasts</h4>
            <div className="text-sm text-gray-600 dark:text-gray-400">
              Currently showing {toastStore.toasts.length} toast(s)
            </div>
            <Button 
              variant="outline" 
              onClick={toastStore.clearAll}
              disabled={toastStore.toasts.length === 0}
            >
              Clear All Toasts
            </Button>
          </div>

          <CodeBlock>
{`// Basic toast
toast.success('Operation completed!');

// Toast with description
toast.error('Network Error', 'Unable to connect to the server.');

// Toast with custom duration
useToastStore.getState().addToast({
  title: 'Custom Toast',
  description: 'This toast stays for 10 seconds',
  type: 'info',
  duration: 10000
});`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Loading and Progress Alerts */}
      <Card>
        <CardHeader>
          <CardTitle>Process & Loading Alerts</CardTitle>
          <CardDescription>
            Alerts for ongoing processes, loading states, and progress indicators.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert>
            <Zap className="h-4 w-4 animate-pulse" />
            <AlertTitle>Processing Request</AlertTitle>
            <AlertDescription>
              Your request is being processed. This may take a few moments...
            </AlertDescription>
          </Alert>

          <Alert variant="warning">
            <Download className="h-4 w-4" />
            <AlertTitle>Download in Progress</AlertTitle>
            <AlertDescription>
              Downloading large-dataset.csv (45% complete). Please don't close this tab.
            </AlertDescription>
          </Alert>

          <Alert variant="success">
            <CheckCircle className="h-4 w-4" />
            <AlertTitle>Backup Completed</AlertTitle>
            <AlertDescription>
              Automatic backup completed successfully at 2:30 AM. Next backup scheduled for tomorrow at 2:30 AM.
            </AlertDescription>
          </Alert>

          <CodeBlock>
{`<Alert>
  <Zap className="h-4 w-4 animate-pulse" />
  <AlertTitle>Processing Request</AlertTitle>
  <AlertDescription>
    Your request is being processed...
  </AlertDescription>
</Alert>`}
          </CodeBlock>
        </CardContent>
      </Card>

      {/* Best Practices */}
      <Card>
        <CardHeader>
          <CardTitle>Best Practices</CardTitle>
          <CardDescription>
            Guidelines for effective alert and notification usage.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="text-sm font-semibold mb-3">Alert Usage Guidelines</h4>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Use <strong>success</strong> alerts for confirmations</li>
                <li>• Use <strong>warning</strong> alerts for potential issues</li>
                <li>• Use <strong>error</strong> alerts for critical problems</li>
                <li>• Use <strong>info</strong> alerts for general information</li>
                <li>• Keep messages concise and actionable</li>
                <li>• Include relevant actions when appropriate</li>
              </ul>
            </div>
            
            <div>
              <h4 className="text-sm font-semibold mb-3">Toast Guidelines</h4>
              <ul className="text-sm space-y-2 text-gray-600 dark:text-gray-400">
                <li>• Auto-dismiss after 3-5 seconds</li>
                <li>• Position consistently (usually top-right)</li>
                <li>• Use for temporary feedback</li>
                <li>• Avoid for critical information</li>
                <li>• Stack multiple toasts clearly</li>
                <li>• Allow manual dismissal</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Alerts;