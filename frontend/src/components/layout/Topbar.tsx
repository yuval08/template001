import React from 'react';
import { Menu, Moon, Sun, Monitor, Search } from 'lucide-react';
import { useTheme } from '@/hooks/useTheme';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { NotificationInbox } from '@/components/NotificationInbox';
import { GlobalSearch, CommandPalette } from '@/components/search';

interface TopbarProps {
  onMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const { theme, setTheme } = useTheme();
  const { isOpen, open, close } = useCommandPalette();

  return (
    <>
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

          {/* Center - Search (hidden on mobile, shown on larger screens) */}
          <div className="flex-1 max-w-2xl mx-4 hidden md:block">
            <GlobalSearch 
              placeholder="Search everything... (⌘K)"
              showCommandHint
              className="w-full"
            />
          </div>

          {/* Right side - Actions */}
          <div className="flex items-center space-x-4">
            {/* Mobile Search Button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="p-2 md:hidden" 
              onClick={open}
              aria-label="Open search"
            >
              <Search className="h-5 w-5" />
            </Button>

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
          <NotificationInbox />
        </div>
      </div>
    </header>

      {/* Global Command Palette */}
      <CommandPalette
        isOpen={isOpen}
        onClose={close}
      />
    </>
  );
};