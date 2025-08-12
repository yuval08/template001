import React from 'react';
import { useTranslation } from 'react-i18next';
import { Menu, Moon, Sun, Monitor, Search, User, LogOut, Settings, ChevronDown } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useTheme } from '@/hooks/useTheme';
import { useCommandPalette } from '@/hooks/useCommandPalette';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuLabel,
} from '@/components/ui/dropdown-menu';
import { Badge } from '@/components/ui/badge';
import { NotificationInbox } from '@/components/NotificationInbox';
import { GlobalSearch, CommandPalette } from '@/components/search';
import { NetworkStatusIndicator } from '@/components/NetworkStatusIndicator';
import { LanguageSwitcher } from '@/components/common';
import { getUserRoleLabel, getUserRoleBadgeColor } from '@/entities/user/types/user.types';

interface TopbarProps {
  onMenuToggle: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onMenuToggle }) => {
  const { theme, setTheme } = useTheme();
  const { isOpen, open, close } = useCommandPalette();
  const { user, isAuthenticated, signOut } = useAuth();
  const { t } = useTranslation('layout');
  const navigate = useNavigate();

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
              placeholder={t('topbar.search_placeholder')}
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
              aria-label={t('topbar.search_aria_label')}
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
                {t('topbar.theme.light')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('dark')}>
                <Moon className="mr-2 h-4 w-4" />
                {t('topbar.theme.dark')}
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme('system')}>
                <Monitor className="mr-2 h-4 w-4" />
                {t('topbar.theme.system')}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {/* Language Switcher */}
          <LanguageSwitcher />

          {/* Network Status Indicator */}
          <NetworkStatusIndicator />

          {/* Notifications */}
          <NotificationInbox />

          {/* User Profile Dropdown */}
          {isAuthenticated && user && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 px-3 py-2">
                  <div className="flex items-center gap-2">
                    {/* Avatar */}
                    <div className="h-8 w-8 bg-primary rounded-full flex items-center justify-center">
                      <span className="text-sm font-medium text-primary-foreground">
                        {user.firstName?.[0]}{user.lastName?.[0]}
                      </span>
                    </div>
                    
                    {/* User Info (hidden on mobile) */}
                    <div className="hidden md:flex flex-col items-start">
                      <span className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.firstName} {user.lastName}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {getUserRoleLabel(user.role)}
                      </span>
                    </div>
                    
                    <ChevronDown className="h-4 w-4 text-gray-500 hidden md:block" />
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div className="flex flex-col space-y-1">
                    <p className="text-sm font-medium leading-none">
                      {user.firstName} {user.lastName}
                    </p>
                    <p className="text-xs leading-none text-muted-foreground">
                      {user.email}
                    </p>
                    <div className="pt-1">
                      <Badge 
                        variant="secondary" 
                        className={`text-xs ${getUserRoleBadgeColor(user.role)}`}
                      >
                        {getUserRoleLabel(user.role)}
                      </Badge>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={() => navigate('/profile')}>
                  <User className="mr-2 h-4 w-4" />
                  <span>{t('topbar.profile.profile')}</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => navigate('/settings')}>
                  <Settings className="mr-2 h-4 w-4" />
                  <span>{t('topbar.profile.settings')}</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={() => signOut()}
                  className="text-red-600 dark:text-red-400"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>{t('topbar.profile.sign_out')}</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}
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