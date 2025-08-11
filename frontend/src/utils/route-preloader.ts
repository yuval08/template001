// Utility function to preload routes
export const preloadRoute = (importFn: () => Promise<any>) => {
  importFn();
};

// Example usage in router or navigation components
export const preloadRoutes = () => {
  // Preload commonly used routes
  preloadRoute(() => import('@/pages/Dashboard'));
  preloadRoute(() => import('@/pages/Profile'));
  preloadRoute(() => import('@/pages/Settings'));
};