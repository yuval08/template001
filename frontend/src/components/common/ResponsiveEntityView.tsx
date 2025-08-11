import React from 'react';
import { cn } from '@/utils/cn';

interface ResponsiveEntityViewProps {
  /**
   * Desktop view component - typically a table
   */
  desktopView: React.ReactNode;
  /**
   * Mobile view component - typically a list of cards
   */
  mobileView: React.ReactNode;
  /**
   * Breakpoint at which to switch from mobile to desktop view
   * @default 'lg' (1024px)
   */
  breakpoint?: 'sm' | 'md' | 'lg' | 'xl';
  /**
   * Additional className for the container
   */
  className?: string;
}

const breakpointClasses = {
  sm: {
    desktop: 'hidden sm:block',
    mobile: 'sm:hidden',
  },
  md: {
    desktop: 'hidden md:block', 
    mobile: 'md:hidden',
  },
  lg: {
    desktop: 'hidden lg:block',
    mobile: 'lg:hidden',
  },
  xl: {
    desktop: 'hidden xl:block',
    mobile: 'xl:hidden',
  },
};

export const ResponsiveEntityView: React.FC<ResponsiveEntityViewProps> = ({
  desktopView,
  mobileView,
  breakpoint = 'lg',
  className,
}) => {
  return (
    <div className={cn(className)}>
      {/* Desktop View */}
      <div className={breakpointClasses[breakpoint].desktop}>
        {desktopView}
      </div>

      {/* Mobile View */}
      <div className={breakpointClasses[breakpoint].mobile}>
        {mobileView}
      </div>
    </div>
  );
};