import React from 'react';
import { cn } from '@/utils/cn';

interface PageLayoutProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  className?: string;
  maxWidth?: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '4xl' | '6xl' | 'full';
  padding?: 'sm' | 'md' | 'lg';
  spacing?: 'sm' | 'md' | 'lg';
}

const maxWidthClasses = {
  sm: 'max-w-sm',
  md: 'max-w-md', 
  lg: 'max-w-lg',
  xl: 'max-w-xl',
  '2xl': 'max-w-2xl',
  '4xl': 'max-w-4xl',
  '6xl': 'max-w-6xl',
  full: 'max-w-full',
};

const paddingClasses = {
  sm: 'px-4 py-6',
  md: 'px-4 sm:px-6 lg:px-8 py-8',
  lg: 'px-6 sm:px-8 lg:px-12 py-10',
};

const spacingClasses = {
  sm: 'space-y-4',
  md: 'space-y-6 sm:space-y-8', 
  lg: 'space-y-8 sm:space-y-10',
};

export const PageLayout: React.FC<PageLayoutProps> = ({
  title,
  description,
  children,
  actions,
  className,
  maxWidth = '6xl',
  padding = 'md',
  spacing = 'md',
}) => {
  return (
    <div className={cn(
      'container mx-auto',
      maxWidthClasses[maxWidth],
      paddingClasses[padding],
      spacingClasses[spacing],
      className
    )}>
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-4 mb-6 sm:mb-8">
        <div className="flex-1">
          <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
            {title}
          </h1>
          {description && (
            <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
              {description}
            </p>
          )}
        </div>
        {actions && (
          <div className="flex flex-col sm:flex-row gap-2">
            {actions}
          </div>
        )}
      </div>
      
      <div className={spacingClasses[spacing]}>
        {children}
      </div>
    </div>
  );
};