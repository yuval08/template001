import React, { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ResponsiveProjectView } from '@/components/projects/ResponsiveProjectView';
import { useProjects, Project } from '@/entities/project';
import { debounce } from 'lodash';

type SortingState = Array<{
  id: string;
  desc: boolean;
}>;

const Tables: React.FC = () => {
  // Table state - default sort by name
  const [sorting, setSorting] = useState<SortingState>([
    { id: 'name', desc: false }
  ]);
  const [searchInput, setSearchInput] = useState(''); // For the input field
  const [globalFilter, setGlobalFilter] = useState(''); // For the actual API call
  const [statusFilter, setStatusFilter] = useState<string>();
  const [pagination, setPagination] = useState({
    pageIndex: 0,
    pageSize: 10,
  });

  // Debounced search functionality
  const debouncedSetGlobalFilter = useCallback(
    debounce((value: string) => {
      setGlobalFilter(value);
      // Reset to first page when search changes
      setPagination(prev => ({ ...prev, pageIndex: 0 }));
    }, 500),
    []
  );

  // Effect to handle search input changes
  useEffect(() => {
    debouncedSetGlobalFilter(searchInput);
  }, [searchInput, debouncedSetGlobalFilter]);

  // Cleanup debounced function on unmount
  useEffect(() => {
    return () => {
      debouncedSetGlobalFilter.cancel();
    };
  }, [debouncedSetGlobalFilter]);

  // Check if any filters are active
  const hasActiveFilters = searchInput.trim() !== '' || statusFilter !== undefined;

  // Clear all filters function
  const handleClearFilters = () => {
    setSearchInput('');
    setGlobalFilter('');
    setStatusFilter(undefined);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
    
    // Cancel any pending debounced search
    debouncedSetGlobalFilter.cancel();
  };

  // Data fetching
  const { data: projectsResponse, isLoading, error } = useProjects({
    pageNumber: pagination.pageIndex + 1,
    pageSize: pagination.pageSize,
    search: globalFilter,
    sortBy: sorting.length > 0 ? sorting[0]?.id : undefined,
    sortDirection: sorting.length > 0 && sorting[0]?.desc ? 'desc' : 'asc',
  });

  const projects = projectsResponse?.data || [];
  const totalCount = projectsResponse?.totalCount || 0;

  // Handler functions with pagination reset
  const handleGlobalFilterChange = (filter: string) => {
    setSearchInput(filter);
  };

  const handleSortingChange = (newSorting: SortingState) => {
    setSorting(newSorting);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleStatusFilterChange = (status: string | undefined) => {
    setStatusFilter(status);
    setPagination(prev => ({ ...prev, pageIndex: 0 }));
  };

  const handleEdit = (project: Project) => {
    console.log('Edit project:', project);
  };

  const handleDelete = async (project: Project) => {
    console.log('Delete project:', project);
    
    // Smart pagination adjustment after deletion
    const currentPageProjects = projects.length;
    const isLastItemOnPage = currentPageProjects === 1;
    const isNotOnFirstPage = pagination.pageIndex > 0;
    
    if (isLastItemOnPage && isNotOnFirstPage) {
      setPagination(prev => ({
        ...prev,
        pageIndex: prev.pageIndex - 1
      }));
    }
  };




  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 space-y-6 sm:space-y-8">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
          Tables Showcase
        </h1>
        <p className="mt-2 text-sm sm:text-base text-gray-600 dark:text-gray-400">
          Advanced table functionality with responsive design, debounced search, sorting, filtering, and pagination.
        </p>
      </div>

      <Card>
        <CardHeader className="p-4 sm:p-6">
          <CardTitle className="text-lg sm:text-xl">Projects Table</CardTitle>
          <CardDescription className="text-sm">
            Manage projects with advanced table features. Desktop view shows full table, mobile view shows cards.
          </CardDescription>
        </CardHeader>
        <CardContent className="p-4 sm:p-6">
          <ResponsiveProjectView
            projects={projects}
            totalCount={totalCount}
            loading={isLoading}
            error={error}
            pagination={pagination}
            sorting={sorting}
            globalFilter={searchInput}
            statusFilter={statusFilter}
            hasActiveFilters={hasActiveFilters}
            onPaginationChange={setPagination}
            onSortingChange={handleSortingChange}
            onGlobalFilterChange={handleGlobalFilterChange}
            onStatusFilterChange={handleStatusFilterChange}
            onClearFilters={handleClearFilters}
            onEdit={handleEdit}
            onDelete={handleDelete}
          />
        </CardContent>
      </Card>
    </div>
  );
};

export default Tables;