import { create } from 'zustand';
import { Project, ProjectSummary } from '@/types';
import { devtools, logger } from '../middleware';

interface ProjectState {
  // Cache for frequently accessed data
  selectedProjectId: string | null;
  recentProjects: Project[];
  projectSummary: ProjectSummary | null;
  
  // UI state specific to projects
  projectListView: 'grid' | 'list';
  projectFilters: {
    status: string[];
    search: string;
    sortBy: 'name' | 'created' | 'updated';
    sortOrder: 'asc' | 'desc';
  };
}

interface ProjectActions {
  setSelectedProject: (projectId: string | null) => void;
  setRecentProjects: (projects: Project[]) => void;
  addRecentProject: (project: Project) => void;
  setProjectSummary: (summary: ProjectSummary) => void;
  setProjectListView: (view: 'grid' | 'list') => void;
  setProjectFilters: (filters: Partial<ProjectState['projectFilters']>) => void;
  resetFilters: () => void;
}

type ProjectStore = ProjectState & ProjectActions;

const initialState: ProjectState = {
  selectedProjectId: null,
  recentProjects: [],
  projectSummary: null,
  projectListView: 'grid',
  projectFilters: {
    status: [],
    search: '',
    sortBy: 'updated',
    sortOrder: 'desc',
  },
};

export const useProjectStore = create<ProjectStore>()(
  devtools(
    { name: 'ProjectStore', enabled: process.env.NODE_ENV === 'development' }
  )(
    logger(
      { name: 'Project', enabled: process.env.NODE_ENV === 'development', collapsed: true }
    )(
      (set, get) => ({
        ...initialState,
        
        setSelectedProject: (selectedProjectId) => set({ selectedProjectId }),
        
        setRecentProjects: (recentProjects) => set({ recentProjects }),
        
        addRecentProject: (project) => set((state) => {
          const filtered = state.recentProjects.filter(p => p.id !== project.id);
          return {
            recentProjects: [project, ...filtered].slice(0, 5) // Keep only 5 recent projects
          };
        }),
        
        setProjectSummary: (projectSummary) => set({ projectSummary }),
        
        setProjectListView: (projectListView) => set({ projectListView }),
        
        setProjectFilters: (filters) => set((state) => ({
          projectFilters: { ...state.projectFilters, ...filters }
        })),
        
        resetFilters: () => set({ 
          projectFilters: initialState.projectFilters 
        }),
      })
    )
  )
);

// Selectors
export const projectSelectors = {
  selectedProject: () => useProjectStore((state) => state.selectedProjectId),
  recentProjects: () => useProjectStore((state) => state.recentProjects),
  projectSummary: () => useProjectStore((state) => state.projectSummary),
  projectListView: () => useProjectStore((state) => state.projectListView),
  projectFilters: () => useProjectStore((state) => state.projectFilters),
  hasActiveFilters: () => useProjectStore((state) => {
    const { status, search } = state.projectFilters;
    return status.length > 0 || search.trim().length > 0;
  }),
};

// Actions
export const projectActions = {
  setSelectedProject: (id: string | null) => useProjectStore.getState().setSelectedProject(id),
  addRecentProject: (project: Project) => useProjectStore.getState().addRecentProject(project),
  setProjectSummary: (summary: ProjectSummary) => useProjectStore.getState().setProjectSummary(summary),
  setProjectListView: (view: 'grid' | 'list') => useProjectStore.getState().setProjectListView(view),
  updateFilters: (filters: Partial<ProjectState['projectFilters']>) => useProjectStore.getState().setProjectFilters(filters),
  resetFilters: () => useProjectStore.getState().resetFilters(),
};