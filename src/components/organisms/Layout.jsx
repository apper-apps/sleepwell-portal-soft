import { Outlet } from 'react-router-dom';
import { useState } from 'react';
import { AnimatePresence } from 'framer-motion';
import Sidebar from '@/components/organisms/Sidebar';
import Header from '@/components/organisms/Header';
import { useUser } from '@/hooks/useUser';
import Loading from '@/components/ui/Loading';

const Layout = () => {
  const { user, loading } = useUser();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  
  if (loading) {
    return <Loading type="dashboard" />;
  }
  
  return (
    <div className="min-h-screen bg-surface flex">
      <AnimatePresence>
        <Sidebar 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      </AnimatePresence>
      
      <div className="flex-1 flex flex-col">
        <Header 
          onMenuClick={() => setSidebarOpen(true)}
          showMobileMenu={sidebarOpen}
        />
        
        <main className="flex-1 overflow-auto">
          <div className="h-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;