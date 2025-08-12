import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  ColumnFiltersState,
  PaginationState,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { User, getUserRoleLabel, getUserRoleBadgeColor, UserRoles } from '@/entities/user';
import { formatRelativeTime } from '@/utils/formatters';
import { UserTableSkeleton } from '@/components/skeletons';
import { 
  Edit,
  Trash2,
  Search,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  ChevronLeft,
  ChevronRight,
  Shield,
  X,
} from 'lucide-react';

interface UserTableProps {
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
  onPaginationChange: (pagination: PaginationState) => void;
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

export const UserTable: React.FC<UserTableProps> = ({
  users,
  totalCount,
  loading,
  error,
  pagination,
  sorting,
  globalFilter,
  roleFilter,
  showInactive,
  currentUserEmail,
  hasActiveFilters,
  onPaginationChange,
  onSortingChange,
  onGlobalFilterChange,
  onRoleFilterChange,
  onShowInactiveChange,
  onClearFilters,
  onEditUser,
  onEditRole,
  onDeleteUser,
  canEditUsers,
}) => {
  const { t } = useTranslation(['users', 'common']);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);

  const columns: ColumnDef<User>[] = [
    {
      accessorKey: 'firstName',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          {t('table.headers.name')}
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div>
          <div className="font-medium">
            {row.original.firstName} {row.original.lastName}
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            {row.original.email}
          </div>
          {row.original.department && (
            <div className="text-xs text-gray-400">
              {row.original.department}
            </div>
          )}
        </div>
      ),
    },
    {
      accessorKey: 'role',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          {t('table.headers.role')}
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <span className={`px-2 py-1 text-xs rounded-full font-medium ${getUserRoleBadgeColor(row.original.role)}`}>
          {getUserRoleLabel(row.original.role)}
        </span>
      ),
    },
    {
      accessorKey: 'jobTitle',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          {t('table.headers.job_title')}
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <div className="text-sm">
          {row.original.jobTitle || '-'}
        </div>
      ),
    },
    {
      accessorKey: 'isActive',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          {t('table.headers.status')}
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => (
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
          row.original.isActive 
            ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
            : 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
        }`}>
          {row.original.isActive ? t('status.active') : t('status.inactive')}
        </span>
      ),
    },
    {
      accessorKey: 'createdAt',
      header: ({ column }) => (
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
          className="h-auto p-0 font-semibold"
        >
          {t('table.headers.created')}
          {column.getIsSorted() === "asc" ? (
            <ArrowUp className="ml-2 h-4 w-4" />
          ) : column.getIsSorted() === "desc" ? (
            <ArrowDown className="ml-2 h-4 w-4" />
          ) : (
            <ArrowUpDown className="ml-2 h-4 w-4" />
          )}
        </Button>
      ),
      cell: ({ row }) => row.original.createdAt ? formatRelativeTime(row.original.createdAt) : '-',
    },
    ...(canEditUsers ? [{
      id: 'actions',
      header: t('table.headers.actions'),
      cell: ({ row }: { row: any }) => (
        <div className="flex gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditUser(row.original)}
            title={t('actions.edit_profile')}
          >
            <Edit className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEditRole(row.original)}
            title={t('actions.change_role')}
          >
            <Shield className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDeleteUser(row.original)}
            disabled={row.original.email === currentUserEmail}
            className={`${row.original.email === currentUserEmail ? 'text-gray-400' : 'text-red-600 hover:text-red-700'}`}
            title={row.original.email === currentUserEmail ? t('actions.cannot_delete_yourself') : t('actions.delete_user')}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      ),
      enableSorting: false,
      enableHiding: false,
    }] : []),
  ];

  const table = useReactTable({
    data: users,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      pagination,
    },
    onSortingChange: (updaterOrValue) => {
      const newSorting = typeof updaterOrValue === 'function' 
        ? updaterOrValue(sorting) 
        : updaterOrValue;
      onSortingChange(newSorting);
    },
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange,
    onPaginationChange: (updaterOrValue) => {
      const newPagination = typeof updaterOrValue === 'function' 
        ? updaterOrValue(pagination) 
        : updaterOrValue;
      onPaginationChange(newPagination);
    },
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{t('table.error_loading', { message: error.message })}</p>
      </div>
    );
  }

  if (loading) {
    return <UserTableSkeleton rows={pagination.pageSize} />;
  }

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder={t('table.search_placeholder')}
            value={globalFilter}
            onChange={(e) => onGlobalFilterChange(e.target.value)}
            className="pl-10 w-64"
          />
        </div>

        {/* Role Filter */}
        {onRoleFilterChange && (
          <Select
            value={roleFilter || 'all'}
            onValueChange={(value) => onRoleFilterChange(value === 'all' ? undefined : value)}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder={t('table.filter_all_roles')} />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t('table.filter_all_roles')}</SelectItem>
              <SelectItem value={UserRoles.ADMIN}>{getUserRoleLabel(UserRoles.ADMIN)}</SelectItem>
              <SelectItem value={UserRoles.MANAGER}>{getUserRoleLabel(UserRoles.MANAGER)}</SelectItem>
              <SelectItem value={UserRoles.EMPLOYEE}>{getUserRoleLabel(UserRoles.EMPLOYEE)}</SelectItem>
            </SelectContent>
          </Select>
        )}

        {/* Show Inactive Filter */}
        {onShowInactiveChange && (
          <div className="flex items-center space-x-2">
            <Checkbox
              id="showInactive"
              checked={showInactive || false}
              onCheckedChange={(checked) => onShowInactiveChange(checked === true)}
            />
            <Label htmlFor="showInactive" className="text-sm font-medium">
              {t('buttons.show_inactive')}
            </Label>
          </div>
        )}

        {/* Clear Filters Button */}
        {hasActiveFilters && onClearFilters && (
          <Button
            variant="outline"
            size="sm"
            onClick={onClearFilters}
            className="ml-auto text-sm"
          >
            <X className="mr-2 h-4 w-4" />
            {t('buttons.clear_filters')}
          </Button>
        )}
      </div>

      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b bg-gray-50 dark:bg-gray-800">
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="px-4 py-3 text-left font-semibold">
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                  {t('table.no_results')}
                </td>
              </tr>
            ) : (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="border-b hover:bg-gray-50 dark:hover:bg-gray-800"
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-3">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
        </div>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-between">
        <div className="text-sm text-gray-600 dark:text-gray-400">
          {t('table.pagination.showing', {
            from: pagination.pageIndex * pagination.pageSize + 1,
            to: Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount),
            total: totalCount
          })}
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
            {t('table.pagination.previous')}
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            {t('table.pagination.next')}
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};