import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  FileText, 
  Table, 
  ClipboardList,
  LogOut,
  X,
  MousePointer,
  Bell,
  MessageSquare,
  CreditCard,
  Type,
  Palette,
  BellRing,
  TestTube,
  ChevronDown,
  ChevronRight,
  Sparkles
} from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';
import { cn } from '@/utils/cn';

interface SidebarProps {
  isOpen: boolean;
  onToggle: () => void;
}

interface NavigationItem {
  name: string;
  href?: string;
  icon: React.ComponentType<{ className?: string }>;
  roles?: string[];
  isDev?: boolean;
  children?: NavigationItem[];
}

const navigation: NavigationItem[] = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Users', href: '/users', icon: Users, roles: ['Admin'] },
  { name: 'Reports', href: '/reports', icon: FileText },
  { 
    name: 'Showcase', 
    icon: Sparkles,
    children: [
      { name: 'Forms', href: '/forms', icon: ClipboardList },
      { name: 'Tables', href: '/tables', icon: Table },
      { name: 'UI Showcase', href: '/ui-showcase', icon: Palette },
      { name: 'Buttons', href: '/buttons', icon: MousePointer },
      { name: 'Alerts', href: '/alerts', icon: Bell },
      { name: 'Dialogs', href: '/dialogs', icon: MessageSquare },
      { name: 'Cards & Badges', href: '/cards-and-badges', icon: CreditCard },
      { name: 'Inputs', href: '/inputs', icon: Type },
      { name: 'Notifications', href: '/notifications', icon: BellRing },
      { name: 'Test Notifications', href: '/test-notifications', icon: TestTube, isDev: true },
    ]
  },
];

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onToggle }) => {
  const location = useLocation();
  const { user, signOut, hasAnyRole } = useAuth();
  const [expandedItems, setExpandedItems] = React.useState<string[]>([]);

  const isDevelopment = import.meta.env.DEV;
  
  const filterNavigation = (items: NavigationItem[]): NavigationItem[] => {
    return items
      .filter(item => {
        // Check role permissions
        if (item.roles && !hasAnyRole(item.roles)) return false;
        // Check if it's a dev-only item
        if (item.isDev && !isDevelopment) return false;
        return true;
      })
      .map(item => {
        if (item.children) {
          const filteredChildren = filterNavigation(item.children);
          return filteredChildren.length > 0 ? { ...item, children: filteredChildren } : null;
        }
        return item;
      })
      .filter(Boolean) as NavigationItem[];
  };
  
  const filteredNavigation = filterNavigation(navigation);
  
  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName)
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };
  
  const isExpanded = (itemName: string) => expandedItems.includes(itemName);
  
  const isActiveInChildren = (children?: NavigationItem[]) => {
    if (!children) return false;
    return children.some(child => location.pathname === child.href);
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-black bg-opacity-50 lg:hidden"
          onClick={onToggle}
        />
      )}

      {/* Sidebar */}
      <div className={cn(
        'fixed inset-y-0 left-0 z-50 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out lg:translate-x-0 lg:static lg:inset-0',
        isOpen ? 'translate-x-0' : '-translate-x-full'
      )}>
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="flex items-center justify-between h-16 px-6 border-b border-gray-200 dark:border-gray-800">
            <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
              Intranet
            </h1>
            <button
              onClick={onToggle}
              className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
            >
              <X className="h-6 w-6" />
            </button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 px-4 py-6 space-y-2">
            {filteredNavigation.map((item) => {
              if (item.children) {
                const hasActiveChild = isActiveInChildren(item.children);
                const expanded = isExpanded(item.name);
                
                return (
                  <div key={item.name} className="space-y-1">
                    <button
                      onClick={() => toggleExpanded(item.name)}
                      className={cn(
                        'flex items-center justify-between w-full px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                        hasActiveChild
                          ? 'bg-primary/10 text-primary'
                          : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                      )}
                    >
                      <div className="flex items-center">
                        <item.icon className="mr-3 h-5 w-5" />
                        {item.name}
                      </div>
                      {expanded ? (
                        <ChevronDown className="h-4 w-4" />
                      ) : (
                        <ChevronRight className="h-4 w-4" />
                      )}
                    </button>
                    
                    {expanded && (
                      <div className="ml-6 space-y-1">
                        {item.children.map((child) => {
                          const isActive = location.pathname === child.href;
                          return (
                            <Link
                              key={child.name}
                              to={child.href!}
                              className={cn(
                                'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                                isActive
                                  ? 'bg-primary text-primary-foreground'
                                  : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800'
                              )}
                              onClick={() => {
                                // Close mobile sidebar on navigation
                                if (window.innerWidth < 1024) {
                                  onToggle();
                                }
                              }}
                            >
                              <child.icon className="mr-3 h-4 w-4" />
                              {child.name}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              }
              
              // Regular navigation item
              const isActive = location.pathname === item.href;
              return (
                <Link
                  key={item.name}
                  to={item.href!}
                  className={cn(
                    'flex items-center px-4 py-2 text-sm font-medium rounded-lg transition-colors',
                    isActive
                      ? 'bg-primary text-primary-foreground'
                      : 'text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800'
                  )}
                  onClick={() => {
                    // Close mobile sidebar on navigation
                    if (window.innerWidth < 1024) {
                      onToggle();
                    }
                  }}
                >
                  <item.icon className="mr-3 h-5 w-5" />
                  {item.name}
                </Link>
              );
            })}
          </nav>

          {/* User info and logout */}
          <div className="px-4 py-6 border-t border-gray-200 dark:border-gray-800">
            <div className="flex items-center mb-4">
              <div className="flex-shrink-0">
                <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                  <span className="text-sm font-medium text-primary-foreground">
                    {user?.firstName?.[0]}{user?.lastName?.[0]}
                  </span>
                </div>
              </div>
              <div className="ml-3">
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={signOut}
              className="flex items-center w-full px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
            >
              <LogOut className="mr-3 h-5 w-5" />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </>
  );
};