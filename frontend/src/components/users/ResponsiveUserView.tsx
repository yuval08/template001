import React from 'react';
import { User } from '@/entities/user';
import { UserTable } from './UserTable';
import { UserList } from './UserList';

interface ResponsiveUserViewProps {
  users: User[];
  totalCount: number;
  loading: boolean;
  error?: Error | null;
  pagination: {
    pageIndex: number;
    pageSize: number;
  };
  sorting?: Array<{
    id: string;
    desc: boolean;
  }>;
  globalFilter: string;
  onPaginationChange: (pagination: { pageIndex: number; pageSize: number }) => void;
  onSortingChange?: (sorting: Array<{ id: string; desc: boolean }>) => void;
  onGlobalFilterChange: (filter: string) => void;
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
        <UserTable {...props} sorting={props.sorting || []} />
      </div>

      {/* Mobile Card View */}
      <div className="lg:hidden">
        <UserList {...props} />
      </div>
    </>
  );
};