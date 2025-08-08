import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { AlertTriangle, Home } from 'lucide-react';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { checkAuth } = useAuth();
  const error = searchParams.get('error');
  const message = searchParams.get('message');

  useEffect(() => {
    // If there's no error, check auth status and redirect to dashboard
    if (!error) {
      const processAuth = async () => {
        try {
          await checkAuth();
          navigate('/dashboard', { replace: true });
        } catch (authError) {
          console.error('Auth check failed:', authError);
          navigate('/login', { replace: true });
        }
      };

      processAuth();
    }
  }, [error, checkAuth, navigate]);

  // If there's an error, show error page
  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full">
          <Card>
            <CardHeader className="text-center">
              <div className="mx-auto h-16 w-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mb-4">
                <AlertTriangle className="h-8 w-8 text-red-600 dark:text-red-400" />
              </div>
              <CardTitle className="text-red-900 dark:text-red-100">Authentication Error</CardTitle>
            </CardHeader>
            <CardContent className="text-center space-y-4">
              <p className="text-gray-600 dark:text-gray-400">
                {message || 'An error occurred during authentication. Please try again.'}
              </p>
              <div className="space-y-2">
                <Button
                  onClick={() => navigate('/login', { replace: true })}
                  className="w-full"
                >
                  Try Again
                </Button>
                <Button
                  onClick={() => navigate('/', { replace: true })}
                  variant="outline"
                  className="w-full"
                >
                  <Home className="mr-2 h-4 w-4" />
                  Go Home
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state while processing authentication
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Signing you in...
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Please wait while we complete your authentication.
        </p>
      </div>
    </div>
  );
};

export default Callback;