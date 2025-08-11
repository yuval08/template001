import React from 'react';
import { Loader2 } from 'lucide-react';

const LoadingFallback: React.FC = () => {
  return (
    <div className="flex justify-center items-center min-h-screen">
      <div className="text-center">
        <Loader2 className="mx-auto mb-4 h-12 w-12 animate-spin text-primary" />
        <p className="text-lg text-gray-600 dark:text-gray-400">
          Loading...
        </p>
      </div>
    </div>
  );
};

export default LoadingFallback;