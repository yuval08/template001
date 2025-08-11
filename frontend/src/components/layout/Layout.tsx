import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { Breadcrumb } from '@/components/ui/breadcrumb';
import { ToastContainer } from '@/components/ui/toast-container';
import { ScrollToTop } from '@/components/ScrollToTop';
import { useBreadcrumbs } from '@/hooks/useBreadcrumbs';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const breadcrumbs = useBreadcrumbs();

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ScrollToTop />
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuToggle={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto">
            <div className="p-6 pb-4 border-b border-gray-200 dark:border-gray-800">
              <Breadcrumb items={breadcrumbs} />
            </div>
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
};