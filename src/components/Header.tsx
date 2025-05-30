import React, { useState } from 'react';
import { Bell, User, Settings } from 'lucide-react';

interface HeaderProps {
  title: string;
}

const Header: React.FC<HeaderProps> = ({ title }) => {
  const [notifications, setNotifications] = useState(3);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);

  return (
    <header className="bg-white border-b border-gray-200">
      <div className="px-4 sm:px-6 py-4 flex justify-between items-center">
        <h1 className="text-2xl font-semibold text-gray-800">{title}</h1>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <button
              onClick={() => {
                setShowNotifications(!showNotifications);
                if (showUserMenu) setShowUserMenu(false);
              }}
              className="p-1.5 rounded-full hover:bg-gray-100 transition-colors relative"
            >
              <Bell className="h-5 w-5 text-gray-600" />
              {notifications > 0 && (
                <span className="absolute top-0 right-0 inline-flex items-center justify-center px-2 py-1 text-xs font-bold leading-none text-white transform translate-x-1/2 -translate-y-1/2 bg-red-500 rounded-full">
                  {notifications}
                </span>
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
                <div className="py-2">
                  <div className="px-4 py-2 border-b border-gray-200">
                    <p className="text-sm font-medium text-gray-700">Notifications</p>
                  </div>
                  <div className="max-h-64 overflow-y-auto">
                    <div className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">Fraud Alert Triggered</p>
                      <p className="text-xs text-gray-500">
                        Transaction #38291 flagged as suspicious
                      </p>
                      <p className="text-xs text-gray-400 mt-1">5 minutes ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 transition-colors border-b border-gray-100">
                      <p className="text-sm font-medium text-gray-800">High Risk Customer</p>
                      <p className="text-xs text-gray-500">
                        New profile generated for customer #4829
                      </p>
                      <p className="text-xs text-gray-400 mt-1">27 minutes ago</p>
                    </div>
                    <div className="px-4 py-3 hover:bg-gray-50 transition-colors">
                      <p className="text-sm font-medium text-gray-800">System Update</p>
                      <p className="text-xs text-gray-500">
                        Fraud detection model has been updated
                      </p>
                      <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          <div className="relative">
            <button
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                if (showNotifications) setShowNotifications(false);
              }}
              className="flex items-center space-x-2 hover:bg-gray-100 p-1.5 rounded-full transition-colors"
            >
              <div className="h-8 w-8 rounded-full bg-blue-500 flex items-center justify-center text-white">
                <User className="h-5 w-5" />
              </div>
            </button>

            {showUserMenu && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg overflow-hidden z-20 border border-gray-200">
                <div className="py-1">
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Profile
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Account Settings
                  </a>
                  <a href="#" className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100">
                    Sign out
                  </a>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
