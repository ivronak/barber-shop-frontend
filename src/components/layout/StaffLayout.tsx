import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { StaffSidebar } from './StaffSidebar';
import '@/styles/admin.css';

export const StaffLayout: React.FC = () => {
  // Ensure admin theme class on html so portal content picks up variables
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
          <StaffSidebar />
        </aside>
        
        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};