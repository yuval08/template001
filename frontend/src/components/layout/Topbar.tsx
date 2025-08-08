import React from 'react';
import { Menu, Bell, Moon, Sun, Monitor } from 'lucide-react';
import { useThemeStore } from '@/stores/themeStore';
import { useToastStore } from '@/stores/toastStore';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface TopbarProps {
  onMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const { theme, setTheme } = useThemeStore();
  const { toasts } = useToastStore();

  const unreadNotifications = toasts.filter(toast => toast.type === 'info').length;

  return (
    <header className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 h-16">
      <div className="flex items-center justify-between h-full px-4">
        {/* Left side - Mobile menu button */}
        <div className="flex items-center">
          <button
            onClick={onMenuToggle}
            className="p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 lg:hidden"
          >
            <Menu className="h-6 w-6" />
          </button>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center space-x-4">
          {/* Theme toggle */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="p-2">
                {theme === 'light' && <Sun className="h-5 w-5" />}
                {theme === 'dark' && <Moon className="h-5 w-5" />}
                {theme === 'system' && <Monitor className="h-5 w-5" />}
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme('light')}>
                <Sun className="mr-2 h-4 w-4" />
                Light
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                Dark
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                System
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Notifications */}
          <Button variant="ghost" size="sm" className="p-2 relative">
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 h-5 w-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </Button>
        </div>
      </div>
    </header>
  );
};