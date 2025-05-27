import React from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

interface LayoutProps {
  children: React.ReactNode;
}

const Layout: React.FC<LayoutProps> = ({ children }) => {
  const location = useLocation();
  const getPageTitle = () => {
    switch (location.pathname) {
      case '/':
        return 'Dashboard';
      case '/fraud-explainer':
        return 'Fraud Explainer Agent';
      case '/risk-profile':
        return 'CRM Risk Profile Generator';
      case '/settings':
        return 'Settings';
      default:
        return 'Not Found';
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header title={getPageTitle()} />
        <main className="flex-1 overflow-y-auto p-4 md:p-6">
          {children}
        </main>
        <footer className="bg-white border-t border-gray-200 p-4 text-center text-sm text-gray-500">
          © 2025 Fintech AI Agents Platform
        </footer>
      </div>
    </div>
  );
};

export default Layout;