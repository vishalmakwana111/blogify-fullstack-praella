import { useState, useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Header } from './Header';
import { Sidebar } from './Sidebar';

export function DashboardLayout() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  // Handle responsive behavior
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsMobileSidebarOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Close mobile sidebar when clicking outside or navigating
  useEffect(() => {
    if (isMobileSidebarOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileSidebarOpen]);

  const handleSidebarToggle = () => {
    setIsSidebarCollapsed(!isSidebarCollapsed);
  };

  const handleMobileSidebarOpen = () => {
    setIsMobileSidebarOpen(true);
  };

  const handleMobileSidebarClose = () => {
    setIsMobileSidebarOpen(false);
  };

  return (
    <div className="h-screen bg-gray-50 flex flex-col">
      {/* Fixed Header */}
      <Header />
      
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          onToggle={handleSidebarToggle}
          isMobileOpen={isMobileSidebarOpen}
          onMobileClose={handleMobileSidebarClose}
          onMobileOpen={handleMobileSidebarOpen}
        />

        {/* Main Content Area - Scrollable */}
        <main className={`
          flex-1 transition-all duration-500 ease-in-out
          ${isSidebarCollapsed ? 'lg:ml-8' : 'lg:ml-8'}
          ml-0 overflow-y-auto
        `}>
          <Outlet />
        </main>
      </div>
    </div>
  );
} 