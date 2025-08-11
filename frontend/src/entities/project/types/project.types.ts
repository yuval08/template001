export interface Project {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'completed' | 'paused';
  startDate: string;
  endDate?: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
}

export interface ProjectSummary {
  totalProjects: number;
  activeProjects: number;
  completedProjects: number;
  pausedProjects: number;
  recentActivity: {
    date: string;
    count: number;
  }[];
}

export const ProjectStatus = {
  ACTIVE: 'active',
  COMPLETED: 'completed',
  PAUSED: 'paused',
} as const;

export type ProjectStatusType = typeof ProjectStatus[keyof typeof ProjectStatus];

/**
 * Business logic for project status display
 */
export const getProjectStatusLabel = (status: string): string => {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return 'Active';
    case ProjectStatus.COMPLETED:
      return 'Completed';
    case ProjectStatus.PAUSED:
      return 'Paused';
    default:
      return status;
  }
};

export const getProjectStatusBadgeColor = (status: string): string => {
  switch (status) {
    case ProjectStatus.ACTIVE:
      return 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400';
    case ProjectStatus.COMPLETED:
      return 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400';
    case ProjectStatus.PAUSED:
      return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400';
    default:
      return 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400';
  }
};