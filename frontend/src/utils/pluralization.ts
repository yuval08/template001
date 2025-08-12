import { TFunction } from 'i18next';

/**
 * Spanish Pluralization Utility Functions
 * 
 * Spanish pluralization rules:
 * - Singular (one): n = 1 (e.g., "1 usuario")
 * - Plural (other): n != 1 (e.g., "0 usuarios", "2 usuarios", "5 usuarios")
 * 
 * This differs from English which also has a zero form in some contexts.
 */

/**
 * Gets the appropriate pluralization key for Spanish
 * @param count - The count to determine pluralization for
 * @returns 'one' for singular (n=1), 'other' for plural (n!=1)
 */
export const getSpanishPluralForm = (count: number): 'one' | 'other' => {
  return count === 1 ? 'one' : 'other';
};

/**
 * Helper function to translate with automatic pluralization
 * @param t - Translation function from useTranslation
 * @param key - Base translation key (without _one/_other suffix)
 * @param count - The count for pluralization
 * @param options - Additional translation options
 */
export const translateWithCount = (
  t: TFunction,
  key: string,
  count: number,
  options?: Record<string, any>
): string => {
  const pluralForm = getSpanishPluralForm(count);
  const translationKey = `${key}_${pluralForm}`;
  
  return t(translationKey, {
    count,
    ...options,
    defaultValue: t(key, { count, ...options })
  });
};

/**
 * Common pluralization patterns for Spanish entities
 */
export const SpanishPluralPatterns = {
  // User-related pluralizations
  users: (t: TFunction, count: number) => 
    translateWithCount(t, 'users:counts.total_users', count),
  
  activeUsers: (t: TFunction, count: number) => 
    translateWithCount(t, 'users:counts.active_users', count),
  
  inactiveUsers: (t: TFunction, count: number) => 
    translateWithCount(t, 'users:counts.inactive_users', count),
  
  selectedUsers: (t: TFunction, count: number) => 
    translateWithCount(t, 'users:counts.users_selected', count),
  
  // Project-related pluralizations
  projects: (t: TFunction, count: number) => 
    translateWithCount(t, 'projects:counts.total_projects', count),
  
  activeProjects: (t: TFunction, count: number) => 
    translateWithCount(t, 'projects:counts.active_projects', count),
  
  completedProjects: (t: TFunction, count: number) => 
    translateWithCount(t, 'projects:counts.completed_projects', count),
  
  // Notification-related pluralizations
  notifications: (t: TFunction, count: number) => 
    translateWithCount(t, 'notifications:counts.total_notifications', count),
  
  unreadNotifications: (t: TFunction, count: number) => 
    translateWithCount(t, 'notifications:counts.unread_notifications', count),
  
  readNotifications: (t: TFunction, count: number) => 
    translateWithCount(t, 'notifications:counts.read_notifications', count),
  
  // Generic pluralizations
  items: (t: TFunction, count: number) => 
    translateWithCount(t, 'common:counts.items', count),
  
  results: (t: TFunction, count: number) => 
    translateWithCount(t, 'common:counts.results', count),
  
  records: (t: TFunction, count: number) => 
    translateWithCount(t, 'common:counts.records', count),
  
  selected: (t: TFunction, count: number) => 
    translateWithCount(t, 'common:counts.selected', count),
};

/**
 * Pagination text helper for Spanish
 * @param t - Translation function
 * @param start - Starting index
 * @param end - Ending index
 * @param total - Total count
 * @param entityType - Type of entity (users, projects, notifications)
 */
export const formatPaginationText = (
  t: TFunction,
  start: number,
  end: number,
  total: number,
  entityType: 'users' | 'projects' | 'notifications' = 'users'
): string => {
  const key = `${entityType}:table.pagination_info`;
  return translateWithCount(t, key, total, { start, end, total });
};

/**
 * Time-based pluralizations for Spanish
 */
export const SpanishTimePatterns = {
  minutesAgo: (t: TFunction, count: number) => 
    translateWithCount(t, 'common:time.minutes_ago', count),
  
  hoursAgo: (t: TFunction, count: number) => 
    translateWithCount(t, 'common:time.hours_ago', count),
  
  daysAgo: (t: TFunction, count: number) => 
    translateWithCount(t, 'common:time.days_ago', count),
  
  weeksAgo: (t: TFunction, count: number) => 
    translateWithCount(t, 'common:time.weeks_ago', count),
  
  monthsAgo: (t: TFunction, count: number) => 
    translateWithCount(t, 'common:time.months_ago', count),
  
  yearsAgo: (t: TFunction, count: number) => 
    translateWithCount(t, 'common:time.years_ago', count),
};

/**
 * Message patterns for bulk operations
 */
export const SpanishMessagePatterns = {
  // User messages
  usersDeleted: (t: TFunction, count: number) => 
    translateWithCount(t, 'users:messages.users_deleted', count),
  
  usersCreated: (t: TFunction, count: number) => 
    translateWithCount(t, 'users:messages.users_created', count),
  
  invitationsSent: (t: TFunction, count: number) => 
    translateWithCount(t, 'users:messages.invitations_sent', count),
  
  // Project messages
  projectsDeleted: (t: TFunction, count: number) => 
    translateWithCount(t, 'projects:messages.projects_deleted', count),
  
  projectsCreated: (t: TFunction, count: number) => 
    translateWithCount(t, 'projects:messages.projects_created', count),
  
  // Notification messages
  notificationsDeleted: (t: TFunction, count: number) => 
    translateWithCount(t, 'notifications:messages.notifications_deleted', count),
  
  notificationsCreated: (t: TFunction, count: number) => 
    translateWithCount(t, 'notifications:messages.notification_created', count),
};

/**
 * Format count with proper Spanish number formatting
 * @param count - The number to format
 * @param locale - The locale (defaults to 'es-ES')
 */
export const formatSpanishNumber = (count: number, locale: string = 'es-ES'): string => {
  return new Intl.NumberFormat(locale).format(count);
};

/**
 * Complete example of using Spanish pluralization in a component:
 * 
 * ```tsx
 * import { useTranslation } from 'react-i18next';
 * import { SpanishPluralPatterns, formatPaginationText } from '@/utils/pluralization';
 * 
 * const MyComponent: React.FC = () => {
 *   const { t } = useTranslation(['users', 'common']);
 *   const userCount = 5;
 *   
 *   return (
 *     <div>
 *       <h2>{SpanishPluralPatterns.users(t, userCount)}</h2>
 *       <p>{formatPaginationText(t, 1, 10, userCount, 'users')}</p>
 *     </div>
 *   );
 * };
 * ```
 */