import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ErrorBoundary } from './ErrorBoundary';
import { ErrorFallback, InlineError } from './ErrorFallback';
import { useErrorHandler } from '@/utils/errorHandler';
import { AppError, NetworkError, ValidationError, BusinessError } from '@/shared/types/errors';

/**
 * Example component demonstrating different error handling scenarios
 * This is for testing and demonstration purposes
 */
export function ErrorHandlingExample() {
  const { handleError, handleApiError, handleValidationError } = useErrorHandler();
  const [networkError, setNetworkError] = useState<boolean>(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string[]> | null>(null);

  // Simulate different types of errors
  const simulateNetworkError = () => {
    const error = new Error('Network request failed') as NetworkError;
    error.type = 'NetworkError';
    error.isRetryable = true;
    handleApiError(error);
  };

  const simulateValidationError = () => {
    const error = new Error('Validation failed') as ValidationError;
    error.type = 'ValidationError';
    error.errorCode = 'VALIDATION_ERROR';
    error.errors = {
      email: ['Email is required', 'Email format is invalid'],
      password: ['Password must be at least 8 characters'],
      confirmPassword: ['Passwords do not match'],
    };
    
    setValidationErrors(error.errors);
    handleValidationError(error);
  };

  const simulateBusinessError = () => {
    const error = new Error('User account is suspended') as BusinessError;
    error.type = 'BusinessError';
    error.errorCode = 'ACCOUNT_SUSPENDED';
    handleApiError(error);
  };

  const simulateReactError = () => {
    throw new Error('This is a React component error for testing ErrorBoundary');
  };

  const simulateNetworkState = () => {
    setNetworkError(!networkError);
  };

  const clearValidationErrors = () => {
    setValidationErrors(null);
  };

  return (
    <div className="space-y-6 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Error Handling Examples</CardTitle>
          <CardDescription>
            Demonstrate different error handling scenarios and UI states
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h3 className="font-semibold">API Error Simulations</h3>
              <div className="space-y-2">
                <Button onClick={simulateNetworkError} variant="destructive" size="sm">
                  Network Error
                </Button>
                <Button onClick={simulateValidationError} variant="destructive" size="sm">
                  Validation Error
                </Button>
                <Button onClick={simulateBusinessError} variant="destructive" size="sm">
                  Business Error
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <h3 className="font-semibold">UI State Simulations</h3>
              <div className="space-y-2">
                <Button onClick={simulateNetworkState} variant="outline" size="sm">
                  Toggle Network Error State
                </Button>
                <Button onClick={clearValidationErrors} variant="outline" size="sm">
                  Clear Validation Errors
                </Button>
              </div>
            </div>
          </div>

          {/* Inline error example */}
          {networkError && (
            <InlineError 
              message="Unable to connect to the server. Please check your connection."
              onRetry={() => setNetworkError(false)}
            />
          )}

          {/* Validation errors display */}
          {validationErrors && (
            <Card className="border-destructive/20">
              <CardHeader>
                <CardTitle className="text-destructive text-sm">Validation Errors</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {Object.entries(validationErrors).map(([field, errors]) => (
                    <div key={field} className="text-sm">
                      <span className="font-medium capitalize">{field}:</span>
                      <ul className="ml-4 list-disc text-destructive">
                        {errors.map((error, index) => (
                          <li key={index}>{error}</li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* ErrorBoundary example */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">ErrorBoundary Test</CardTitle>
              <CardDescription>
                This section is wrapped with ErrorBoundary to catch React errors
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ErrorBoundary fallback={<ErrorFallback title="Component Error" />}>
                <ComponentThatMayError />
                <Button onClick={simulateReactError} variant="destructive" size="sm">
                  Trigger React Error
                </Button>
              </ErrorBoundary>
            </CardContent>
          </Card>
        </CardContent>
      </Card>
    </div>
  );
}

/**
 * Example component that may throw errors
 */
function ComponentThatMayError() {
  const [shouldError, setShouldError] = useState(false);

  if (shouldError) {
    throw new Error('Component intentionally crashed!');
  }

  return (
    <div className="p-2 border rounded bg-green-50 text-green-800 text-sm mb-2">
      Component is working normally. 
      <Button 
        variant="link" 
        size="sm" 
        className="text-green-800 h-auto p-1 underline"
        onClick={() => setShouldError(true)}
      >
        Click to crash this component
      </Button>
    </div>
  );
}