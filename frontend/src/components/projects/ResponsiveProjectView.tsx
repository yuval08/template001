import React from 'react';
import { ProjectTable } from './ProjectTable';
import { ProjectList } from './ProjectList';
import type { SortingState, PaginationState, OnChangeFn } from '@tanstack/react-table';
import { Project } from '@/entities/project';

export interface ResponsiveProjectViewProps {
  projects: Project[];
  totalCount: number;
  loading: boolean;
  error?: Error | null;
  pagination: PaginationState;
  sorting: SortingState;
  globalFilter: string;
  statusFilter?: string;
  hasActiveFilters?: boolean;
  onPaginationChange: OnChangeFn<PaginationState>;
  onSortingChange: OnChangeFn<SortingState>;
  onGlobalFilterChange: (filter: string) => void;
  onStatusFilterChange?: (status: string | undefined) => void;
  onClearFilters?: () => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
}

export const ResponsiveProjectView: React.FC<ResponsiveProjectViewProps> = (props) => {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <ProjectTable {...props} />
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <ProjectList {...props} />
      </div>
    </>
  );
};