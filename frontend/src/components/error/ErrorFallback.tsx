import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTranslation } from 'react-i18next';

interface ErrorFallbackProps {
  error?: Error;
  resetError?: () => void;
  title?: string;
  description?: string;
  showRetry?: boolean;
  className?: string;
}

/**
 * Simple error fallback component for use within ErrorBoundary or other error states
 */
export function ErrorFallback({
  error,
  resetError,
  title,
  description,
  showRetry = true,
  className,
}: ErrorFallbackProps) {
  const { t } = useTranslation('common');
  return (
    <Card className={className}>
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 w-8 h-8 rounded-full bg-destructive/10 flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-destructive" />
        </div>
        <CardTitle className="text-lg">{title || t('errors.somethingWentWrong')}</CardTitle>
        <CardDescription>{description || t('errors.errorOccurred')}</CardDescription>
      </CardHeader>
      
      <CardContent>
        {process.env.NODE_ENV === 'development' && error && (
          <div className="mb-4 p-3 bg-destructive/5 border border-destructive/20 rounded text-sm">
            <strong>{t('errors.errorLabel')}</strong> {error.message}
          </div>
        )}
        
        {showRetry && resetError && (
          <div className="flex justify-center">
            <Button onClick={resetError} size="sm" className="flex items-center gap-2">
              <RefreshCw className="w-3 h-3" />
              {t('errors.tryAgain')}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

/**
 * Inline error message component for smaller error states
 */
export function InlineError({ 
  message, 
  onRetry, 
  className = '' 
}: { 
  message: string; 
  onRetry?: () => void; 
  className?: string; 
}) {
  const { t } = useTranslation('common');
  return (
    <div className={`flex items-center gap-3 p-3 bg-destructive/5 border border-destructive/20 rounded-lg ${className}`}>
      <AlertTriangle className="w-4 h-4 text-destructive flex-shrink-0" />
      <span className="text-sm text-destructive flex-1">{message}</span>
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} className="flex items-center gap-1">
          <RefreshCw className="w-3 h-3" />
          {t('errors.retry')}
        </Button>
      )}
    </div>
  );
}