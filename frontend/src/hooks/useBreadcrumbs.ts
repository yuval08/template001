import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { 
  Home, 
  LayoutDashboard, 
  Users, 
  FileText, 
  Table, 
  ClipboardList, 
  MousePointer, 
  Bell, 
  MessageSquare, 
  CreditCard, 
  Type, 
  Palette, 
  BellRing, 
  TestTube,
  Sparkles
} from 'lucide-react';
import { BreadcrumbItem } from '@/components/ui/breadcrumb';

interface RouteConfig {
  path: string;
  label: string;
  icon?: React.ComponentType<{ className?: string }>;
  parent?: string;
}

const routeConfigs: RouteConfig[] = [
  { path: '/', label: 'Home', icon: Home },
  { path: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/users', label: 'Users', icon: Users },
  { path: '/reports', label: 'Reports', icon: FileText },
  
  // Showcase parent
  { path: '/showcase', label: 'Showcase', icon: Sparkles },
  
  // Showcase children
  { path: '/forms', label: 'Forms', icon: ClipboardList, parent: '/showcase' },
  { path: '/tables', label: 'Tables', icon: Table, parent: '/showcase' },
  { path: '/ui-showcase', label: 'UI Showcase', icon: Palette, parent: '/showcase' },
  { path: '/buttons', label: 'Buttons', icon: MousePointer, parent: '/showcase' },
  { path: '/alerts', label: 'Alerts', icon: Bell, parent: '/showcase' },
  { path: '/dialogs', label: 'Dialogs', icon: MessageSquare, parent: '/showcase' },
  { path: '/cards-and-badges', label: 'Cards & Badges', icon: CreditCard, parent: '/showcase' },
  { path: '/inputs', label: 'Inputs', icon: Type, parent: '/showcase' },
  { path: '/notifications', label: 'Notifications', icon: BellRing, parent: '/showcase' },
  { path: '/test-notifications', label: 'Test Notifications', icon: TestTube, parent: '/showcase' },
];

export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const location = useLocation();
  
  return useMemo(() => {
    const currentRoute = routeConfigs.find(route => route.path === location.pathname);
    
    if (!currentRoute) {
      // Default fallback for unknown routes
      return [
        { label: 'Home', href: '/', icon: Home },
        { label: 'Unknown Page' }
      ];
    }
    
    const breadcrumbs: BreadcrumbItem[] = [];
    
    // Always start with Home if not already there
    if (currentRoute.path !== '/') {
      breadcrumbs.push({ label: 'Home', href: '/', icon: Home });
    }
    
    // Add parent if exists
    if (currentRoute.parent) {
      const parentRoute = routeConfigs.find(route => route.path === currentRoute.parent);
      if (parentRoute) {
        breadcrumbs.push({
          label: parentRoute.label,
          href: parentRoute.path,
          icon: parentRoute.icon
        });
      }
    }
    
    // Add current route (without href to make it non-clickable)
    breadcrumbs.push({
      label: currentRoute.label,
      icon: currentRoute.icon
    });
    
    return breadcrumbs;
  }, [location.pathname]);
};

export default useBreadcrumbs;