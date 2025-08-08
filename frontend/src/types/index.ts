// Re-export user types from dedicated user types file
export * from './user';

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

export interface FileUploadResponse {
  id: string;
  fileName: string;
  originalName: string;
  contentType: string;
  size: number;
  uploadedAt: string;
  url: string;
}

export interface Toast {
  id: string;
  title: string;
  description?: string;
  type: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

export interface NotificationMessage {
  id: string;
  title: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
  timestamp: string;
  read: boolean;
}

export type Theme = 'light' | 'dark' | 'system';

export interface AuthUser {
  email: string;
  name: string;
  isAuthenticated: boolean;
  // Additional user details from database
  id: string;
  firstName: string;
  lastName: string;
  fullName: string;
  role: string;
  department?: string;
  jobTitle?: string;
  avatar?: string;
  isActive: boolean;
  lastLoginAt?: string;
}