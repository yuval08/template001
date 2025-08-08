import React, { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';

const Callback: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { handleCallback } = useAuth();

  useEffect(() => {
    const processCallback = async () => {
      try {
        await handleCallback();
        
        // Get the return URL from location state or default to dashboard
        const from = (location.state as any)?.from?.pathname || '/dashboard';
        navigate(from, { replace: true });
      } catch (error) {
        console.error('Callback processing failed:', error);
        navigate('/login', { replace: true });
      }
    };

    processCallback();
  }, [handleCallback, navigate, location]);

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