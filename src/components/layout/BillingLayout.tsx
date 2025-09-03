import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { BillingSidebar } from './BillingSidebar';
import '@/styles/admin.css';

export const BillingLayout: React.FC = () => {
  useEffect(() => {
    document.documentElement.classList.add('admin-theme');
    return () => {
      document.documentElement.classList.remove('admin-theme');
    };
  }, []);

  return (
    <div className="admin h-screen w-screen flex flex-col">
      <div className="border-b">
        <Header />
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        <div className="w-64 border-r overflow-y-auto hidden md:block">
          <BillingSidebar />
        </div>
        
        <div className="flex-1 overflow-y-auto p-6">
          <Outlet />
        </div>
      </div>
    </div>
  );
}; 