import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ProjectCard } from './ProjectCard';
import { ResponsiveProjectViewProps } from './ResponsiveProjectView';
import { 
  ChevronLeft, 
  ChevronRight,
  Search,
  X,
} from 'lucide-react';

export const ProjectList: React.FC<ResponsiveProjectViewProps> = ({
  projects,
  totalCount,
  loading,
  error,
  pagination,
  globalFilter,
  statusFilter,
  hasActiveFilters,
  onPaginationChange,
  onGlobalFilterChange,
  onStatusFilterChange,
  onClearFilters,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation('projects');
  
  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{t('table.error_loading')}: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="space-y-3">
        {/* Search with Clear button */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('table.search_placeholder')}
              value={globalFilter}
              onChange={(e) => onGlobalFilterChange(e.target.value)}
              className="pl-10"
            />
          </div>
          {hasActiveFilters && onClearFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-1" />
              {t('actions.clear_filters')}
            </Button>
          )}
        </div>

        {/* Status Filter */}
        {onStatusFilterChange && (
          <div className="flex flex-col gap-2">
            <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
              {t('filters.filter_by_status')}
            </label>
            <select
              value={statusFilter ?? ''}
              onChange={(e) => {
                onStatusFilterChange(e.target.value || undefined);
              }}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground text-sm"
            >
              <option value="">{t('filters.all_statuses')}</option>
              <option value="1">{t('status.planning')}</option>
              <option value="2">{t('status.in_progress')}</option>
              <option value="3">{t('status.on_hold')}</option>
              <option value="4">{t('status.completed')}</option>
              <option value="5">{t('status.cancelled')}</option>
            </select>
          </div>
        )}
      </div>

      {/* Results Summary */}
      <div className="text-sm text-gray-600 dark:text-gray-400">
        {t('pagination.showing')} {projects.length} {t('pagination.of')} {totalCount} {t('pagination.projects')}
      </div>

      {/* Project Cards */}
      {loading ? (
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span className="ml-2">{t('table.loading')}</span>
          </div>
        </div>
      ) : projects.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 dark:text-gray-400">
            {hasActiveFilters ? t('messages.no_projects_match_filters') : t('table.no_results')}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {projects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              onEdit={onEdit}
              onDelete={onDelete}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalCount > 0 && (
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
          {/* Results info */}
          <div className="text-sm text-gray-600 dark:text-gray-400">
            {t('pagination.showing')} {pagination.pageIndex * pagination.pageSize + 1} {t('pagination.to')}{' '}
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              totalCount
            )}{' '}
            {t('pagination.of')} {totalCount} {t('pagination.results')}
          </div>

          {/* Pagination controls */}
          <div className="flex items-center justify-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginationChange({
                ...pagination,
                pageIndex: Math.max(0, pagination.pageIndex - 1)
              })}
              disabled={pagination.pageIndex === 0}
            >
              <ChevronLeft className="h-4 w-4" />
              <span className="hidden sm:inline ml-1">{t('pagination.previous')}</span>
            </Button>

            <div className="flex items-center gap-2 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-md">
              <span className="text-sm">
                {t('pagination.page')} {pagination.pageIndex + 1} {t('pagination.of')} {Math.ceil(totalCount / pagination.pageSize)}
              </span>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={() => onPaginationChange({
                ...pagination,
                pageIndex: pagination.pageIndex + 1
              })}
              disabled={pagination.pageIndex >= Math.ceil(totalCount / pagination.pageSize) - 1}
            >
              <span className="hidden sm:inline mr-1">{t('pagination.next')}</span>
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>

          {/* Page size selector */}
          <div className="flex items-center gap-2 sm:justify-end">
            <span className="text-sm text-gray-600 dark:text-gray-400">{t('pagination.rows_per_page')}</span>
            <select
              value={pagination.pageSize}
              onChange={(e) => {
                onPaginationChange({
                  ...pagination,
                  pageSize: Number(e.target.value),
                  pageIndex: 0, // Reset to first page
                });
              }}
              className="px-2 py-1 border border-input rounded-md bg-background text-foreground text-sm"
            >
              {[5, 10, 20, 50].map(pageSize => (
                <option key={pageSize} value={pageSize}>
                  {pageSize}
                </option>
              ))}
            </select>
          </div>
        </div>
      )}
    </div>
  );
};