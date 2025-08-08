import React, { useState, useMemo } from 'react';
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
  RowSelectionState,
} from '@tanstack/react-table';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useProjects, Project } from '@/entities/project';
import { formatDate } from '@/utils/formatters';
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
} from 'lucide-react';

const Tables: React.FC = () => {
  const [sorting, setSorting] = useState<SortingState>([]);
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([]);
  const [globalFilter, setGlobalFilter] = useState('');
  const [rowSelection, setRowSelection] = useState<RowSelectionState>({});
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  const { data: projectsResponse, isLoading, error } = useProjects({
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    search: globalFilter,
    sortBy: sorting[0]?.id,
    sortDirection: sorting[0]?.desc ? 'desc' : 'asc',
  });

  const projects = projectsResponse?.data || [];
  const totalCount = projectsResponse?.totalCount || 0;

  const columns = useMemo<ColumnDef<Project>[]>(
    () => [
      {
        id: 'select',
        header: ({ table }) => (
          <input
            type="checkbox"
            checked={table.getIsAllRowsSelected()}
            onChange={table.getToggleAllRowsSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        cell: ({ row }) => (
          <input
            type="checkbox"
            checked={row.getIsSelected()}
            onChange={row.getToggleSelectedHandler()}
            className="rounded border-gray-300"
          />
        ),
        enableSorting: false,
        enableHiding: false,
      },
      {
        accessorKey: 'name',
        header: ({ column }) => {
          return (
            <Button
              variant="ghost"
              onClick={() => column.toggleSorting(column.getIsSorted() === "asc")}
              className="h-auto p-0 font-semibold"
            >
              Project Name
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
        header: 'Description',
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
              Status
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
          
          // Map numeric status to string
          const statusMap: Record<number, string> = {
            1: 'Planning',
            2: 'In Progress',
            3: 'On Hold',
            4: 'Completed',
            5: 'Cancelled'
          };
          
          const statusColors: Record<number, string> = {
            1: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
            2: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
            3: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
            4: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
            5: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400'
          };
          
          const statusText = statusMap[statusValue] || 'Unknown';
          const statusColor = statusColors[statusValue] || 'bg-gray-100 text-gray-800';
          
          return (
            <span className={`px-2 py-1 rounded-full text-xs font-medium whitespace-nowrap ${statusColor}`}>
              {statusText}
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
              Start Date
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
        header: 'End Date',
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
              Created
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
        header: 'Actions',
        cell: ({ row }) => {
          return (
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('Edit project:', row.original);
                }}
              >
                <Edit className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  console.log('Delete project:', row.original);
                }}
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
    []
  );

  const table = useReactTable({
    data: projects,
    columns,
    state: {
      sorting,
      columnFilters,
      globalFilter,
      rowSelection,
      pagination,
    },
    enableRowSelection: true,
    onRowSelectionChange: setRowSelection,
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onGlobalFilterChange: setGlobalFilter,
    onPaginationChange: setPagination,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    manualPagination: true,
    pageCount: Math.ceil(totalCount / pagination.pageSize),
  });

  const selectedRowCount = table.getFilteredSelectedRowModel().rows.length;

  const handleBulkAction = (action: string) => {
    const selectedRows = table.getFilteredSelectedRowModel().rows;
    console.log(`Bulk ${action}:`, selectedRows.map(row => row.original));
    
    // Reset selection after action
    setRowSelection({});
  };

  const exportData = () => {
    // Simple CSV export
    const headers = columns
      .filter(col => col.id !== 'select' && col.id !== 'actions')
      .map(col => col.header)
      .join(',');
    
    const rows = projects.map((project: Project) => [
      project.name,
      project.description,
      project.status,
      formatDate(project.startDate),
      project.endDate ? formatDate(project.endDate) : '',
      formatDate(project.createdAt)
    ].join(',')).join('\\n');
    
    const csv = `${headers}\\n${rows}`;
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
        <p className="text-red-500">Error loading projects: {error.message}</p>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
          Tables Showcase
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Advanced table functionality with TanStack Table including sorting, filtering, pagination, and bulk actions.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projects Table</CardTitle>
          <CardDescription>
            Manage projects with advanced table features including sorting, filtering, pagination, and row selection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {/* Table Controls */}
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-4">
              {/* Global Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Search projects..."
                  value={globalFilter}
                  onChange={(e) => setGlobalFilter(e.target.value)}
                  className="pl-10 w-80"
                />
              </div>

              {/* Status Filter */}
              <select
                value={(table.getColumn('status')?.getFilterValue() as string) ?? ''}
                onChange={(e) => {
                  table.getColumn('status')?.setFilterValue(e.target.value || undefined);
                }}
                className="px-3 py-2 border border-input rounded-md bg-background text-foreground"
              >
                <option value="">All Statuses</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
                <option value="paused">Paused</option>
              </select>
            </div>

            <div className="flex items-center gap-2">
              {/* Bulk Actions */}
              {selectedRowCount > 0 && (
                <div className="flex items-center gap-2 mr-4">
                  <span className="text-sm text-gray-600 dark:text-gray-400">
                    {selectedRowCount} selected
                  </span>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('export')}
                  >
                    Export Selected
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleBulkAction('delete')}
                    className="text-red-600 hover:text-red-700"
                  >
                    Delete Selected
                  </Button>
                </div>
              )}

              <Button variant="outline" onClick={exportData}>
                <Download className="mr-2 h-4 w-4" />
                Export CSV
              </Button>
            </div>
          </div>

          {/* Table */}
          <div className="rounded-md border">
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
                {isLoading ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center">
                      <div className="flex items-center justify-center">
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                        <span className="ml-2">Loading projects...</span>
                      </div>
                    </td>
                  </tr>
                ) : table.getRowModel().rows.length === 0 ? (
                  <tr>
                    <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500">
                      No projects found
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

          {/* Pagination */}
          <div className="flex items-center justify-between mt-6">
            <div className="flex items-center gap-2">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Showing {pagination.pageIndex * pagination.pageSize + 1} to{' '}
                {Math.min(
                  (pagination.pageIndex + 1) * pagination.pageSize,
                  totalCount
                )}{' '}
                of {totalCount} results
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
                <span className="text-sm">Page</span>
                <input
                  type="number"
                  min="1"
                  max={table.getPageCount()}
                  value={pagination.pageIndex + 1}
                  onChange={(e) => {
                    const page = e.target.value ? Number(e.target.value) - 1 : 0;
                    table.setPageIndex(page);
                  }}
                  className="w-16 px-2 py-1 text-sm border rounded-md text-center"
                />
                <span className="text-sm">of {table.getPageCount()}</span>
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
              <span className="text-sm text-gray-600 dark:text-gray-400">Rows per page:</span>
              <select
                value={pagination.pageSize}
                onChange={(e) => {
                  table.setPageSize(Number(e.target.value));
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Tables;