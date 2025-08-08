import React, { Component, ErrorInfo, ReactNode } from 'react';
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
  showDetails?: boolean;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
  errorId: string | null;
}

/**
 * React Error Boundary component that catches JavaScript errors anywhere in the child component tree,
 * logs those errors, and displays a fallback UI instead of the component tree that crashed
 */
export class ErrorBoundary extends Component<Props, State> {
  private errorReportingService?: ErrorReportingService;

  constructor(props: Props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    };

    this.errorReportingService = new ErrorReportingService();
  }

  static getDerivedStateFromError(error: Error): Partial<State> {
    // Update state so the next render will show the fallback UI
    return {
      hasError: true,
      error,
      errorId: generateErrorId(),
    };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    // Log the error
    console.error('ErrorBoundary caught an error:', error, errorInfo);

    // Update state with error info
    this.setState({
      error,
      errorInfo,
    });

    // Report error to external service
    this.errorReportingService?.reportError(error, {
      errorInfo,
      errorId: this.state.errorId,
      userAgent: navigator.userAgent,
      url: window.location.href,
      timestamp: new Date().toISOString(),
    });

    // Call optional error callback
    this.props.onError?.(error, errorInfo);
  }

  private handleRetry = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      errorId: null,
    });
  };

  private handleGoHome = () => {
    window.location.href = '/';
  };

  private handleReportBug = () => {
    const { error, errorId } = this.state;
    const subject = encodeURIComponent(`Bug Report - Error ID: ${errorId}`);
    const body = encodeURIComponent(
      `Error ID: ${errorId}\n` +
      `URL: ${window.location.href}\n` +
      `User Agent: ${navigator.userAgent}\n` +
      `Error: ${error?.message}\n` +
      `Stack: ${error?.stack}`
    );
    
    window.open(`mailto:support@company.com?subject=${subject}&body=${body}`);
  };

  render() {
    if (this.state.hasError) {
      // Custom fallback UI
      if (this.props.fallback) {
        return this.props.fallback;
      }

      const isDevelopment = process.env.NODE_ENV === 'development';
      const { error, errorInfo, errorId } = this.state;

      return (
        <div className="min-h-screen bg-background flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-destructive" />
              </div>
              <CardTitle className="text-2xl font-bold text-foreground">
                Oops! Something went wrong
              </CardTitle>
              <CardDescription className="text-muted-foreground">
                We apologize for the inconvenience. An unexpected error has occurred.
              </CardDescription>
            </CardHeader>
            
            <CardContent className="space-y-4">
              {errorId && (
                <Alert>
                  <AlertDescription>
                    <strong>Error ID:</strong> {errorId}
                    <br />
                    Please reference this ID if you need to contact support.
                  </AlertDescription>
                </Alert>
              )}

              {isDevelopment && error && (
                <div className="space-y-3">
                  <Alert variant="destructive">
                    <Bug className="h-4 w-4" />
                    <AlertDescription>
                      <strong>Development Mode - Error Details:</strong>
                    </AlertDescription>
                  </Alert>
                  
                  <div className="bg-destructive/5 border border-destructive/20 rounded-lg p-4 space-y-2">
                    <div>
                      <strong className="text-destructive">Error:</strong>
                      <p className="text-sm font-mono mt-1">{error.message}</p>
                    </div>
                    
                    {error.stack && (
                      <div>
                        <strong className="text-destructive">Stack Trace:</strong>
                        <pre className="text-xs font-mono mt-1 overflow-x-auto whitespace-pre-wrap bg-background/50 p-2 rounded border">
                          {error.stack}
                        </pre>
                      </div>
                    )}
                    
                    {errorInfo && (
                      <div>
                        <strong className="text-destructive">Component Stack:</strong>
                        <pre className="text-xs font-mono mt-1 overflow-x-auto whitespace-pre-wrap bg-background/50 p-2 rounded border">
                          {errorInfo.componentStack}
                        </pre>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col sm:flex-row gap-3 justify-center pt-4">
                <Button 
                  onClick={this.handleRetry}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className="w-4 h-4" />
                  Try Again
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleGoHome}
                  className="flex items-center gap-2"
                >
                  <Home className="w-4 h-4" />
                  Go Home
                </Button>
                
                <Button 
                  variant="outline" 
                  onClick={this.handleReportBug}
                  className="flex items-center gap-2"
                >
                  <Bug className="w-4 h-4" />
                  Report Bug
                </Button>
              </div>

              {!isDevelopment && (
                <div className="text-center text-sm text-muted-foreground pt-2">
                  If this problem persists, please contact our support team.
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      );
    }

    return this.props.children;
  }
}

/**
 * Error Reporting Service for sending error data to external services
 */
class ErrorReportingService {
  async reportError(error: Error, context: Record<string, any>) {
    try {
      // In production, you might want to send this to a service like Sentry, LogRocket, etc.
      if (process.env.NODE_ENV === 'production') {
        // Example: Send to your logging service
        await fetch('/api/errors/report', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({
            message: error.message,
            stack: error.stack,
            context,
          }),
        }).catch(() => {
          // Silently fail if error reporting fails
          console.warn('Failed to report error to service');
        });
      }
    } catch (reportingError) {
      console.warn('Error reporting failed:', reportingError);
    }
  }
}

/**
 * Generate a unique error ID for tracking
 */
function generateErrorId(): string {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `ERR-${timestamp}-${random}`.toUpperCase();
}

/**
 * HOC for wrapping components with ErrorBoundary
 */
export function withErrorBoundary<P extends object>(
  Component: React.ComponentType<P>,
  errorBoundaryProps?: Omit<Props, 'children'>
) {
  const WrappedComponent = (props: P) => (
    <ErrorBoundary {...errorBoundaryProps}>
      <Component {...props} />
    </ErrorBoundary>
  );
  
  WrappedComponent.displayName = `withErrorBoundary(${Component.displayName || Component.name})`;
  
  return WrappedComponent;
}