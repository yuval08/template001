import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Topbar } from './Topbar';
import { ToastContainer } from '@/components/ui/toast-container';

export const Layout: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="flex h-screen">
        <Sidebar isOpen={sidebarOpen} onToggle={toggleSidebar} />
        
        <div className="flex-1 flex flex-col overflow-hidden">
          <Topbar onMenuToggle={toggleSidebar} />
          
          <main className="flex-1 overflow-y-auto p-6">
            <Outlet />
          </main>
        </div>
      </div>
      
      <ToastContainer />
    </div>
  );
};