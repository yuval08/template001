/**
 * Service Container implementing Dependency Injection pattern
 * Provides centralized service management and instantiation
 */

import { UserService } from '@/entities/user/services';
import { ProjectService } from '@/entities/project/services';
import { FileService } from '@/entities/file/services';
import { ReportService } from '@/entities/report/services';
import { SearchService } from '@/entities/search/services';

// Service type definitions
type ServiceKey = 'userService' | 'projectService' | 'fileService' | 'reportService' | 'searchService';

type ServiceMap = {
  userService: UserService;
  projectService: ProjectService;
  fileService: FileService;
  reportService: ReportService;
  searchService: SearchService;
};

/**
 * Singleton service container
 */
class ServiceContainer {
  private services: Partial<ServiceMap> = {};
  private static instance: ServiceContainer;

  private constructor() {}

  /**
   * Get singleton instance
   */
  public static getInstance(): ServiceContainer {
    if (!ServiceContainer.instance) {
      ServiceContainer.instance = new ServiceContainer();
    }
    return ServiceContainer.instance;
  }

  /**
   * Register a service instance
   */
  public register<K extends ServiceKey>(key: K, service: ServiceMap[K]): void {
    this.services[key] = service;
  }

  /**
   * Get service instance, creating if not exists
   */
  public get<K extends ServiceKey>(key: K): ServiceMap[K] {
    if (!this.services[key]) {
      this.services[key] = this.createService(key);
    }
    return this.services[key] as ServiceMap[K];
  }

  /**
   * Create service instance
   */
  private createService<K extends ServiceKey>(key: K): ServiceMap[K] {
    switch (key) {
      case 'userService':
        return new UserService() as ServiceMap[K];
      case 'projectService':
        return new ProjectService() as ServiceMap[K];
      case 'fileService':
        return new FileService() as ServiceMap[K];
      case 'reportService':
        return new ReportService() as ServiceMap[K];
      case 'searchService':
        return new SearchService() as ServiceMap[K];
      default:
        throw new Error(`Unknown service: ${key}`);
    }
  }

  /**
   * Clear all services (useful for testing)
   */
  public clear(): void {
    this.services = {};
  }
}

// Export singleton instance
export const serviceContainer = ServiceContainer.getInstance();

// Export service getter functions for easier consumption
export const getService = <K extends ServiceKey>(key: K): ServiceMap[K] => {
  return serviceContainer.get(key);
};

// Specific service getters
export const getUserService = () => getService('userService');
export const getProjectService = () => getService('projectService');
export const getFileService = () => getService('fileService');
export const getReportService = () => getService('reportService');
export const getSearchService = () => getService('searchService');