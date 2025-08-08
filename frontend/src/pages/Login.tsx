import React from 'react';
import { useAuth } from '@/hooks/useAuth';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { LogIn, Shield } from 'lucide-react';

const Login: React.FC = () => {
  const { login, isLoading } = useAuth();

  const handleLogin = async () => {
    try {
      await login();
    } catch (error) {
      console.error('Login failed:', error);
    }
  };

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

        {/* Login Card */}
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Sign In</CardTitle>
            <CardDescription>
              Use your organizational credentials to access the system
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="text-center">
              <Button
                onClick={handleLogin}
                disabled={isLoading}
                className="w-full"
                size="lg"
              >
                {isLoading ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Signing In...
                  </>
                ) : (
                  <>
                    <LogIn className="mr-2 h-5 w-5" />
                    Sign In with SSO
                  </>
                )}
              </Button>
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