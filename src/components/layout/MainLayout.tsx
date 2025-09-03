import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export const MainLayout: React.FC = () => {
  // ensure admin theme class on html element so portals (modals) inherit variables
  useEffect(() => {
    document.documentElement.classList.add('admin-theme');
    return () => {
      document.documentElement.classList.remove('admin-theme');
    };
  }, []);

  return (
    <div className="admin min-h-screen flex flex-col">
      <Header />
      
      <div className="flex flex-1">
        <aside className="hidden md:block w-60 border-r border-border shrink-0">
          <Sidebar />
        </aside>
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};