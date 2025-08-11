import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { LogIn, Shield, CheckCircle } from 'lucide-react';

const Login: React.FC = () => {
  const { login, isLoading, authConfig, user, isAuthenticated } = useAuth();
  const [loginProvider, setLoginProvider] = useState<'google' | 'microsoft'>('google');
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const hasInvitation = searchParams.get('accept-invitation') === 'true';

  // Redirect to dashboard if user is already authenticated
  useEffect(() => {
    if (isAuthenticated && user) {
      navigate('/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const handleLogin = async (provider: 'google' | 'microsoft') => {
    try {
      setLoginProvider(provider);
      await login(provider);
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

  // Show loading spinner while checking authentication
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto"></div>
          <p className="mt-4 text-gray-600 dark:text-gray-400">Checking authentication...</p>
        </div>
      </div>
    );
  }

  // Don't render login form if already authenticated (redirect will happen via useEffect)
  if (isAuthenticated && user) {
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        {/* Header */}
        <div className="text-center">
          <div className="mx-auto h-16 w-16 bg-primary rounded-full flex items-center justify-center">
            <Shield className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="mt-6 text-3xl font-bold text-gray-900 dark:text-white">
            Welcome to Intranet
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Secure access to your workspace
          </p>
        </div>

        {/* Invitation Alert */}
        {hasInvitation && (
          <Alert className="bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800">
            <CheckCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
            <AlertDescription className="text-green-800 dark:text-green-200">
              <strong>Welcome!</strong> Your invitation has been accepted. Simply log in with your organizational account to start using the system.
            </AlertDescription>
          </Alert>
        )}

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Use your organizational credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-3">
              {authConfig.googleEnabled && (
                <Button
                  onClick={() => handleLogin('google')}
                  disabled={isLoading}
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                  size="lg"
                >
                  {isLoading && loginProvider === 'google' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                        <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                        <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                        <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                      </svg>
                      Sign In with Google
                    </>
                  )}
                </Button>
              )}
              
              {authConfig.microsoftEnabled && (
                <Button
                  onClick={() => handleLogin('microsoft')}
                  disabled={isLoading}
                  className="w-full bg-gray-700 hover:bg-gray-800 text-white"
                  size="lg"
                >
                  {isLoading && loginProvider === 'microsoft' ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                      Signing In...
                    </>
                  ) : (
                    <>
                      <svg className="mr-2 h-5 w-5" viewBox="0 0 24 24">
                        <path fill="currentColor" d="M11.4 24H0V12.6h11.4V24zM24 24H12.6V12.6H24V24zM11.4 11.4H0V0h11.4v11.4zM24 11.4H12.6V0H24v11.4z"/>
                      </svg>
                      Sign In with Microsoft
                    </>
                  )}
                </Button>
              )}
              
              {!authConfig.googleEnabled && !authConfig.microsoftEnabled && (
                <Button
                  disabled
                  className="w-full"
                  size="lg"
                >
                  <LogIn className="mr-2 h-5 w-5" />
                  No Authentication Providers Available
                </Button>
              )}
            </div>

            <div className="text-center text-xs text-gray-500 dark:text-gray-400">
              <p>
                By signing in, you agree to our{' '}
                <a href="#" className="text-primary hover:underline">
                  Terms of Service
                </a>{' '}
                and{' '}
                <a href="#" className="text-primary hover:underline">
                  Privacy Policy
                </a>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Features */}
        <div className="grid grid-cols-1 gap-4 text-center">
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Secure Access
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Enterprise-grade security with SSO integration
            </p>
          </div>
          <div className="bg-white dark:bg-gray-800 p-4 rounded-lg border">
            <h3 className="font-medium text-gray-900 dark:text-white">
              Role-Based Access
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              Access controls based on your organizational role
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center">
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Need help? Contact{' '}
            <a href="mailto:support@example.com" className="text-primary hover:underline">
              IT Support
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;