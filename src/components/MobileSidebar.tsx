import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  AlertTriangle,
  Users,
  Settings,
  Bot,
  BarChart4,
  Menu,
  X,
} from 'lucide-react';

const MobileSidebar = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="md:hidden p-2 rounded-md text-gray-600 hover:bg-gray-100 transition-colors fixed top-4 left-4 z-30"
      >
        <Menu className="h-6 w-6" />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div
            className="fixed inset-0 bg-gray-600 bg-opacity-75"
            onClick={() => setIsOpen(false)}
          ></div>

          <div className="fixed inset-y-0 left-0 max-w-xs w-full bg-blue-900 text-white shadow-lg z-50 flex flex-col">
            <div className="flex items-center justify-between p-6">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-blue-300" />
                <h1 className="text-xl font-bold">FinConnectAI</h1>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="text-white hover:text-blue-300 transition-colors"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <nav className="mt-6 flex-1 overflow-y-auto">
              <NavLink
                to="/"
                className={({ isActive }) =>
                  `flex items-center py-3 px-6 hover:bg-blue-800 transition-colors ${isActive ? 'bg-blue-800 border-l-4 border-blue-300' : ''}`
                }
                onClick={() => setIsOpen(false)}
                end
              >
                <LayoutDashboard className="h-5 w-5 mr-3" />
                <span>Dashboard</span>
              </NavLink>
              <div className="px-6 pt-6 pb-2">
                <h2 className="text-xs uppercase tracking-wide text-blue-300 font-semibold">
                  Agents
                </h2>
              </div>
              <NavLink
                to="/fraud-explainer"
                className={({ isActive }) =>
                  `flex items-center py-3 px-6 hover:bg-blue-800 transition-colors ${isActive ? 'bg-blue-800 border-l-4 border-blue-300' : ''}`
                }
                onClick={() => setIsOpen(false)}
              >
                <AlertTriangle className="h-5 w-5 mr-3" />
                <span>Fraud Explainer</span>
              </NavLink>
              <NavLink
                to="/risk-profile"
                className={({ isActive }) =>
                  `flex items-center py-3 px-6 hover:bg-blue-800 transition-colors ${isActive ? 'bg-blue-800 border-l-4 border-blue-300' : ''}`
                }
                onClick={() => setIsOpen(false)}
              >
                <Users className="h-5 w-5 mr-3" />
                <span>Risk Profile</span>
              </NavLink>
              <div className="px-6 pt-6 pb-2">
                <h2 className="text-xs uppercase tracking-wide text-blue-300 font-semibold">
                  Analytics
                </h2>
              </div>
              <NavLink
                to="/performance"
                className={({ isActive }) =>
                  `flex items-center py-3 px-6 hover:bg-blue-800 transition-colors ${isActive ? 'bg-blue-800 border-l-4 border-blue-300' : ''}`
                }
                onClick={() => setIsOpen(false)}
              >
                <BarChart4 className="h-5 w-5 mr-3" />
                <span>Performance</span>
              </NavLink>
              <div className="px-6 pt-6 pb-2">
                <h2 className="text-xs uppercase tracking-wide text-blue-300 font-semibold">
                  Settings
                </h2>
              </div>
              <NavLink
                to="/settings"
                className={({ isActive }) =>
                  `flex items-center py-3 px-6 hover:bg-blue-800 transition-colors ${isActive ? 'bg-blue-800 border-l-4 border-blue-300' : ''}`
                }
                onClick={() => setIsOpen(false)}
              >
                <Settings className="h-5 w-5 mr-3" />
                <span>Configuration</span>
              </NavLink>
            </nav>

            <div className="bg-blue-950 p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <div className="h-8 w-8 rounded-full bg-blue-700 flex items-center justify-center">
                    <span className="text-sm font-medium">VS</span>
                  </div>
                  <div>
                    <p className="text-sm font-medium">Vikas Sahani</p>
                    <p className="text-xs text-blue-300">Admin</p>
                  </div>
                </div>
                <Settings className="h-5 w-5 text-blue-300 hover:text-white cursor-pointer" />
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default MobileSidebar;
