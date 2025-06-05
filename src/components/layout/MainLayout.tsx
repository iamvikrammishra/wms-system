import React, { useState } from 'react';
import { Outlet, useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

const pageTitle = {
  '/': 'Dashboard',
  '/data-upload': 'Data Upload',
  '/sku-mapping': 'SKU Mapping',
  '/analytics': 'Analytics',
  '/ai-query': 'AI Query',
};

const MainLayout: React.FC = () => {
  const location = useLocation();
  const [isSidebarExpanded, setIsSidebarExpanded] = useState(true);
  const title = pageTitle[location.pathname as keyof typeof pageTitle] || 'Warehouse Management';

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar 
        isExpanded={isSidebarExpanded} 
        onExpandChange={setIsSidebarExpanded} 
      />
      <div className={`flex-1 flex flex-col overflow-hidden transition-all duration-300 ${isSidebarExpanded ? 'lg:pl-64' : 'lg:pl-16'}`}>
        <Header title={title} />
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default MainLayout;