import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/utils/cn';
import { LucideIcon } from 'lucide-react';

interface MetricCardProps {
  title: string;
  value: string | number;
  description?: string;
  icon?: LucideIcon;
  trend?: {
    value: string;
    type: 'positive' | 'negative' | 'neutral';
    icon?: LucideIcon;
  };
  className?: string;
  animationDelay?: string;
  loading?: boolean;
}

const trendColorClasses = {
  positive: 'text-green-600 dark:text-green-500',
  negative: 'text-red-600 dark:text-red-500', 
  neutral: 'text-blue-600 dark:text-blue-500',
};

export const MetricCard: React.FC<MetricCardProps> = ({
  title,
  value,
  description,
  icon: Icon,
  trend,
  className,
  animationDelay = '0s',
  loading = false,
}) => {
  return (
    <Card 
      className={cn(
        'animate-fadeIn',
        className
      )}
      style={{ animationDelay }}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {title}
        </CardTitle>
        {Icon && (
          <Icon className="h-4 w-4 text-muted-foreground" />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {loading ? '-' : value}
        </div>
        {(description || trend) && (
          <div className="text-xs text-muted-foreground mt-1">
            {trend ? (
              <span className={cn('flex items-center', trendColorClasses[trend.type])}>
                {trend.icon && <trend.icon className="h-3 w-3 mr-1" />}
                {trend.value}
              </span>
            ) : (
              description
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};