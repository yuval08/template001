import React from 'react';
import { User } from '@/entities/user';
import { UserTable } from './UserTable';
import { UserList } from './UserList';
import type { SortingState } from '@tanstack/react-table';

interface ResponsiveUserViewProps {
  users: User[];
  totalCount: number;
  loading: boolean;
  error?: Error | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting: SortingState;
  globalFilter: string;
  roleFilter?: string;
  showInactive?: boolean;
  currentUserEmail?: string;
  hasActiveFilters?: boolean;
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
  onSortingChange: (sorting: SortingState) => void;
  onGlobalFilterChange: (filter: string) => void;
  onRoleFilterChange?: (role: string | undefined) => void;
  onShowInactiveChange?: (showInactive: boolean) => void;
  onClearFilters?: () => void;
  onEditUser: (user: User) => void;
  onEditRole: (user: User) => void;
  onDeleteUser: (user: User) => void;
  canEditUsers: boolean;
}

export const ResponsiveUserView: React.FC<ResponsiveUserViewProps> = (props) => {
  return (
    <>
      {/* Desktop Table View */}
      <div className="hidden lg:block">
        <UserTable {...props} />
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <UserList {...props} />
      </div>
    </>
  );
};