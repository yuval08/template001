import React, { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Project } from '@/entities/project';
import { formatDate } from '@/utils/formatters';
import { ResponsiveProjectViewProps } from './ResponsiveProjectView';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
  ArrowUpDown,
  ArrowUp,
  ArrowDown,
  Search,
  Download,
  Trash2,
  Edit,
  X,
} from 'lucide-react';

export const ProjectTable: React.FC<ResponsiveProjectViewProps> = ({
  projects,
  totalCount,
  loading,
  error,
  pagination,
  sorting,
  globalFilter,
  statusFilter,
  hasActiveFilters,
  onPaginationChange,
  onSortingChange,
  onGlobalFilterChange,
  onStatusFilterChange,
  onClearFilters,
  onEdit,
  onDelete,
}) => {
  const { t } = useTranslation('projects');
  
  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
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
          )
        },
        cell: ({ row }) => {
          return (
            <div className="font-medium">
              {row.getValue('name')}
            </div>
          )
        },
      },
      {
        accessorKey: 'description',
        header: t('table.headers.description'),
        cell: ({ row }) => {
          const description = row.getValue('description') as string;
          return (
            <div className="max-w-[300px] truncate text-sm text-gray-600 dark:text-gray-400">
              {description}
            </div>
          );
        },
      },
      {
        accessorKey: 'status',
        header: ({ column }) => {
          return (
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
          )
        },
        cell: ({ row }) => {
          const statusValue = row.getValue('status') as number;
          
          const statusMap: Record<number, string> = {
            1: 'planning',
            2: 'in_progress',
            3: 'on_hold',
            4: 'completed',
            5: 'cancelled'
          };
          
          const statusColors: Record<number, string> = {
            1: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            4: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            5: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          };
          
          const statusKey = statusMap[statusValue] || 'unknown';
          const statusColor = statusColors[statusValue] || 'bg-gray-100 text-gray-800';
          
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColor}`}>
              {t(`status.${statusKey}`)}
            </span>
          );
        },
        filterFn: 'equals',
      },
      {
        accessorKey: 'startDate',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-semibold"
            >
              {t('table.headers.start_date')}
              {column.getIsSorted() === "asc" ? (
                <ArrowUp className="ml-2 h-4 w-4" />
              ) : column.getIsSorted() === "desc" ? (
                <ArrowDown className="ml-2 h-4 w-4" />
              ) : (
                <ArrowUpDown className="ml-2 h-4 w-4" />
              )}
            </Button>
          )
        },
        cell: ({ row }) => {
          return formatDate(row.getValue('startDate'));
        },
      },
      {
        accessorKey: 'endDate',
        header: t('table.headers.end_date'),
        cell: ({ row }) => {
          const endDate = row.getValue('endDate') as string;
          return endDate ? formatDate(endDate) : '-';
        },
      },
      {
        accessorKey: 'createdAt',
        header: ({ column }) => {
          return (
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
          )
        },
        cell: ({ row }) => {
          return formatDate(row.getValue('createdAt'));
        },
      },
      {
        id: 'actions',
        header: t('table.headers.actions'),
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onEdit(row.original)}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => onDelete(row.original)}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          );
        },
        enableSorting: false,
        enableHiding: false,
      },
    ],
    [onEdit, onDelete, t]
  );

  const table = useReactTable({
    data: projects,
    columns,
    state: {
      sorting,
      globalFilter,
      pagination,
    },
    onSortingChange,
    onGlobalFilterChange,
    onPaginationChange,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    manualSorting: true,
    manualFiltering: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
  });

  const exportData = () => {
    const headers = columns
      .filter(col => col.id !== 'actions')
      .map(col => typeof col.header === 'string' ? col.header : 'Column')
      .join(',');
    
    const rows = projects.map((project: Project) => [
      project.name,
      project.description,
      project.status,
      formatDate(project.startDate),
      project.endDate ? formatDate(project.endDate) : '',
      formatDate(project.createdAt)
    ].join(',')).join('\n');
    
    const csv = `${headers}\n${rows}`;
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'projects.csv';
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (error) {
    return (
      <div className="flex items-center justify-center h-64">
        <p className="text-red-500">{t('table.error_loading')}: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Table Controls */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 sm:gap-4">
          {/* Global Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder={t('table.search_placeholder')}
              value={globalFilter}
              onChange={(e) => onGlobalFilterChange(e.target.value)}
              className="pl-10 w-full sm:w-80"
            />
          </div>

          {/* Status Filter */}
          {onStatusFilterChange && (
            <select
              value={statusFilter ?? ''}
              onChange={(e) => {
                onStatusFilterChange(e.target.value || undefined);
              }}
              className="px-3 py-2 border border-input rounded-md bg-background text-foreground w-full sm:w-auto text-sm"
            >
              <option value="">{t('filters.all_statuses')}</option>
              <option value="1">{t('status.planning')}</option>
              <option value="2">{t('status.in_progress')}</option>
              <option value="3">{t('status.on_hold')}</option>
              <option value="4">{t('status.completed')}</option>
              <option value="5">{t('status.cancelled')}</option>
            </select>
          )}

          {/* Clear Filters Button */}
          {hasActiveFilters && onClearFilters && (
            <Button variant="outline" size="sm" onClick={onClearFilters}>
              <X className="h-4 w-4 mr-1" />
              {t('actions.clear_filters')}
            </Button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={exportData} className="text-sm">
            <Download className="mr-2 h-4 w-4" />
            {t('actions.export_csv')}
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-md border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id} className="border-b bg-gray-50 dark:bg-gray-800">
                  {headerGroup.headers.map((header) => (
                    <th key={header.id} className="px-4 py-3 text-left font-semibold text-sm whitespace-nowrap">
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
              {loading ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                      <span className="ml-2">{t('table.loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
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
                      <td key={cell.id} className="px-4 py-3 text-sm">
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
        <div className="flex items-center gap-2">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            {t('pagination.showing')} {pagination.pageIndex * pagination.pageSize + 1} {t('pagination.to')}{' '}
            {Math.min(
              (pagination.pageIndex + 1) * pagination.pageSize,
              totalCount
            )}{' '}
            {t('pagination.of')} {totalCount} {t('pagination.results')}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(0)}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronsLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          
          <div className="flex items-center gap-1 mx-2">
            <span className="text-sm">{t('pagination.page')}</span>
            <input
              type="number"
              min="1"
              max={table.getPageCount()}
              value={pagination.pageIndex + 1}
              onChange={(e) => {
                const page = e.target.value ? Number(e.target.value) - 1 : 0;
                table.setPageIndex(page);
              }}
              className="w-16 px-2 py-1 text-sm border rounded-md text-center bg-background text-foreground dark:bg-gray-800 dark:text-gray-100 dark:border-gray-600"
            />
            <span className="text-sm">{t('pagination.of')} {table.getPageCount()}</span>
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.setPageIndex(table.getPageCount() - 1)}
            disabled={!table.getCanNextPage()}
          >
            <ChevronsRight className="h-4 w-4" />
          </Button>
        </div>

        <div className="flex items-center gap-2">
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
    </div>
  );
};