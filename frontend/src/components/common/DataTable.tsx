import React from 'react';
import {
  useReactTable,
  getCoreRowModel,
  getPaginationRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  ColumnDef,
  SortingState,
  PaginationState,
  OnChangeFn,
} from '@tanstack/react-table';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  ChevronLeft, 
  ChevronRight, 
  ChevronsLeft, 
  ChevronsRight,
} from 'lucide-react';
import { cn } from '@/utils/cn';
import { useTranslation } from 'react-i18next';

interface DataTableProps<TData> {
  data: TData[];
  columns: ColumnDef<TData>[];
  totalCount?: number;
  loading?: boolean;
  error?: Error | null;
  
  // Pagination
  pagination?: PaginationState;
  onPaginationChange?: OnChangeFn<PaginationState>;
  manualPagination?: boolean;
  
  // Sorting
  sorting?: SortingState;
  onSortingChange?: OnChangeFn<SortingState>;
  manualSorting?: boolean;
  
  // Styling
  className?: string;
  
  // Empty state
  emptyMessage?: string;
  
  // Row selection
  enableRowSelection?: boolean;
  onRowSelectionChange?: OnChangeFn<Record<string, boolean>>;
  rowSelection?: Record<string, boolean>;
}

export function DataTable<TData>({
  data,
  columns,
  totalCount,
  loading = false,
  error,
  pagination,
  onPaginationChange,
  manualPagination = true,
  sorting,
  onSortingChange,
  manualSorting = true,
  className,
  emptyMessage,
  enableRowSelection = false,
  onRowSelectionChange,
  rowSelection,
}: DataTableProps<TData>) {
  const { t } = useTranslation('common');
  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: !manualPagination ? getPaginationRowModel() : undefined,
    getSortedRowModel: !manualSorting ? getSortedRowModel() : undefined,
    getFilteredRowModel: getFilteredRowModel(),
    
    // Manual control
    manualPagination,
    manualSorting,
    
    // Row count
    rowCount: totalCount ?? data.length,
    
    // State
    state: {
      pagination,
      sorting,
      rowSelection,
    },
    
    // Handlers
    onPaginationChange,
    onSortingChange,
    onRowSelectionChange,
    
    // Row selection
    enableRowSelection,
  });

  if (error) {
    return (
      <div className="flex items-center justify-center h-32 text-red-500">
        <p>{t('dataTable.errorLoading', { message: error.message })}</p>
      </div>
    );
  }

  const totalPages = Math.ceil((totalCount ?? 0) / (pagination?.pageSize ?? 10));
  const currentPage = (pagination?.pageIndex ?? 0) + 1;

  return (
    <div className={cn("space-y-4", className)}>
      {/* Table */}
      <div className="rounded-md border">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <tr key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <th
                      key={header.id}
                      className="px-4 py-3 text-left text-sm font-medium text-muted-foreground"
                    >
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
                    <div className="flex items-center justify-center space-x-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      <span className="text-muted-foreground">{t('messages.loading')}</span>
                    </div>
                  </td>
                </tr>
              ) : table.getRowModel().rows.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-muted-foreground">
                    {emptyMessage || t('dataTable.noResults')}
                  </td>
                </tr>
              ) : (
                table.getRowModel().rows.map((row) => (
                  <tr
                    key={row.id}
                    className="border-b transition-colors hover:bg-muted/50"
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
      {pagination && onPaginationChange && totalCount !== undefined && totalCount > 0 && (
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="text-sm text-muted-foreground">
            {t('dataTable.showing', {
              from: Math.min((pagination.pageIndex * pagination.pageSize) + 1, totalCount),
              to: Math.min((pagination.pageIndex + 1) * pagination.pageSize, totalCount),
              total: totalCount
            })}
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="flex items-center space-x-2">
              <span className="text-sm text-muted-foreground">{t('dataTable.rowsPerPage')}</span>
              <Select
                value={pagination.pageSize.toString()}
                onValueChange={(value) =>
                  onPaginationChange({
                    pageIndex: 0,
                    pageSize: Number(value),
                  })
                }
              >
                <SelectTrigger className="w-16 h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[5, 10, 20, 50].map((size) => (
                    <SelectItem key={size} value={size.toString()}>
                      {size}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="flex items-center space-x-1">
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onPaginationChange({
                    ...pagination,
                    pageIndex: 0,
                  })
                }
                disabled={pagination.pageIndex === 0}
              >
                <ChevronsLeft className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onPaginationChange({
                    ...pagination,
                    pageIndex: pagination.pageIndex - 1,
                  })
                }
                disabled={pagination.pageIndex === 0}
              >
                <ChevronLeft className="h-4 w-4" />
              </Button>
              
              <span className="px-3 py-1 text-sm">
                {t('dataTable.page', { current: currentPage, total: totalPages })}
              </span>
              
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onPaginationChange({
                    ...pagination,
                    pageIndex: pagination.pageIndex + 1,
                  })
                }
                disabled={pagination.pageIndex >= totalPages - 1}
              >
                <ChevronRight className="h-4 w-4" />
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() =>
                  onPaginationChange({
                    ...pagination,
                    pageIndex: totalPages - 1,
                  })
                }
                disabled={pagination.pageIndex >= totalPages - 1}
              >
                <ChevronsRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}