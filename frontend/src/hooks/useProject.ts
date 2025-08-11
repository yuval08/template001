import { useEffect } from 'react';
import { projectSelectors, projectActions } from '@/stores';
import { Project, ProjectSummary } from '@/types';

/**
 * Project state management hook
 * Provides project-specific UI state and caching
 */
export const useProject = () => {
  const selectedProjectId = projectSelectors.selectedProject();
  const recentProjects = projectSelectors.recentProjects();
  const projectSummary = projectSelectors.projectSummary();
  const projectListView = projectSelectors.projectListView();
  const projectFilters = projectSelectors.projectFilters();
  const hasActiveFilters = projectSelectors.hasActiveFilters();

  const setSelectedProject = (projectId: string | null) => {
    projectActions.setSelectedProject(projectId);
  };

  const addToRecent = (project: Project) => {
    projectActions.addRecentProject(project);
  };

  const updateSummary = (summary: ProjectSummary) => {
    projectActions.setProjectSummary(summary);
  };

  const setListView = (view: 'grid' | 'list') => {
    projectActions.setProjectListView(view);
  };

  const updateFilters = (filters: Partial<typeof projectFilters>) => {
    projectActions.updateFilters(filters);
  };

  const resetFilters = () => {
    projectActions.resetFilters();
  };

  const setSearchFilter = (search: string) => {
    updateFilters({ search });
  };

  const setStatusFilter = (status: string[]) => {
    updateFilters({ status });
  };

  const setSorting = (sortBy: typeof projectFilters.sortBy, sortOrder: typeof projectFilters.sortOrder) => {
    updateFilters({ sortBy, sortOrder });
  };

  const toggleSortOrder = () => {
    const newOrder = projectFilters.sortOrder === 'asc' ? 'desc' : 'asc';
    updateFilters({ sortOrder: newOrder });
  };

  // Helper to check if a project is selected
  const isProjectSelected = (projectId: string): boolean => {
    return selectedProjectId === projectId;
  };

  // Helper to get current search term
  const getSearchTerm = (): string => {
    return projectFilters.search;
  };

  // Helper to check if status is filtered
  const isStatusFiltered = (status: string): boolean => {
    return projectFilters.status.includes(status);
  };

  return {
    // State
    selectedProjectId,
    recentProjects,
    projectSummary,
    projectListView,
    projectFilters,
    hasActiveFilters,
    
    // Actions
    setSelectedProject,
    addToRecent,
    updateSummary,
    setListView,
    updateFilters,
    resetFilters,
    
    // Filter-specific actions
    setSearchFilter,
    setStatusFilter,
    setSorting,
    toggleSortOrder,
    
    // Utilities
    isProjectSelected,
    getSearchTerm,
    isStatusFiltered,
    isGridView: projectListView === 'grid',
    isListView: projectListView === 'list',
    sortAscending: projectFilters.sortOrder === 'asc',
    sortDescending: projectFilters.sortOrder === 'desc',
  };
};