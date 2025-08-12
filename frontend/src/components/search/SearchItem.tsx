import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { 
  FileText, 
  User, 
  Folder, 
  CheckSquare, 
  HelpCircle,
  ChevronRight,
  Clock
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { SearchResult, SearchEntityType } from '@/entities/search';
import { Badge } from '@/components/ui/badge';
import { formatRelativeTime } from '@/utils/formatters';

interface SearchItemProps {
  result: SearchResult;
  isSelected?: boolean;
  onSelect?: () => void;
  className?: string;
}

const entityIcons = {
  [SearchEntityType.Project]: Folder,
  [SearchEntityType.User]: User,
  [SearchEntityType.Document]: FileText,
  [SearchEntityType.Task]: CheckSquare,
} as const;

const entityColors = {
  [SearchEntityType.Project]: 'bg-blue-50 text-blue-600 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400',
  [SearchEntityType.User]: 'bg-green-50 text-green-600 border-green-200 dark:bg-green-900/20 dark:text-green-400',
  [SearchEntityType.Document]: 'bg-purple-50 text-purple-600 border-purple-200 dark:bg-purple-900/20 dark:text-purple-400',
  [SearchEntityType.Task]: 'bg-orange-50 text-orange-600 border-orange-200 dark:bg-orange-900/20 dark:text-orange-400',
} as const;

/**
 * SearchItem component for displaying individual search results
 * Follows existing UI patterns with proper accessibility and keyboard navigation
 */
export const SearchItem: React.FC<SearchItemProps> = ({
  result,
  isSelected = false,
  onSelect,
  className
}) => {
  const navigate = useNavigate();
  const { t } = useTranslation(['search', 'common']);

  const Icon = entityIcons[result.entityType] || HelpCircle;
  const entityColor = entityColors[result.entityType] || 'bg-gray-50 text-gray-600 border-gray-200';

  const handleClick = () => {
    onSelect?.();
    if (result.navigationUrl) {
      navigate(result.navigationUrl);
    }
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      handleClick();
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffInHours = Math.abs(now.getTime() - date.getTime()) / (1000 * 60 * 60);

    // For very recent items, show relative time using locale-aware formatting
    if (diffInHours < 168) { // Within a week, use relative time
      return formatRelativeTime(date);
    } else {
      // For older items, show formatted date using user's locale
      return date.toLocaleDateString();
    }
  };

  return (
    <div
      role="option"
      aria-selected={isSelected}
      tabIndex={-1}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        'flex items-start gap-3 p-3 rounded-md cursor-pointer transition-all duration-200',
        'hover:bg-gray-50 hover:shadow-sm dark:hover:bg-gray-800',
        'focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2',
        isSelected && 'bg-blue-50 border-blue-200 dark:bg-blue-900/20 dark:border-blue-800',
        className
      )}
    >
      {/* Entity Icon */}
      <div className={cn(
        'flex-shrink-0 p-2 rounded-md border',
        entityColor
      )}>
        <Icon className="h-4 w-4" />
      </div>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <div className="flex items-start justify-between gap-2">
          <div className="flex-1 min-w-0">
            {/* Title */}
            <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100 truncate">
              {result.title}
            </h3>
            
            {/* Description */}
            <p className="text-sm text-gray-600 dark:text-gray-400 line-clamp-2 mt-1">
              {result.description}
            </p>
            
            {/* Metadata */}
            <div className="flex items-center gap-2 mt-2">
              <Badge variant="secondary" className="text-xs">
                {t(`search:entity_types.${result.entityType.toLowerCase()}`)}
              </Badge>
              
              {result.createdAt && (
                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                  <Clock className="h-3 w-3" />
                  <span>{formatDate(result.createdAt)}</span>
                </div>
              )}
              
              {/* Relevance Score (for debugging - can be removed in production) */}
              {process.env.NODE_ENV === 'development' && (
                <Badge variant="outline" className="text-xs">
                  {(result.relevanceScore * 100).toFixed(0)}%
                </Badge>
              )}
            </div>
          </div>

          {/* Navigate Icon */}
          <ChevronRight className="h-4 w-4 text-gray-400 flex-shrink-0 mt-0.5" />
        </div>
      </div>
    </div>
  );
};