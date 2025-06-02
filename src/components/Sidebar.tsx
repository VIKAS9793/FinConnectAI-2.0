import { NavLink } from 'react-router-dom';
import { LayoutDashboard, AlertTriangle, Users, Settings, Bot, BarChart4 } from 'lucide-react';

const Sidebar = () => {
  return (
    <aside className="w-64 bg-blue-900 text-white hidden md:block shadow-lg">
      <div className="p-6">
        <div className="flex items-center space-x-2">
          <Bot className="h-8 w-8 text-blue-300" />
          <h1 className="text-xl font-bold">FinConnectAI</h1>
        </div>
        <p className="text-blue-300 text-xs mt-1">AI Agents Platform</p>
      </div>
      <nav className="mt-6">
        <NavLink
          to="/"
          className={({ isActive }) =>
            `flex items-center py-3 px-6 hover:bg-blue-800 transition-colors ${isActive ? 'bg-blue-800 border-l-4 border-blue-300' : ''}`
          }
          end
        >
          <LayoutDashboard className="h-5 w-5 mr-3" />
          <span>Dashboard</span>
        </NavLink>
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-xs uppercase tracking-wide text-blue-300 font-semibold">Agents</h2>
        </div>
        <NavLink
          to="/fraud-explainer"
          className={({ isActive }) =>
            `flex items-center py-3 px-6 hover:bg-blue-800 transition-colors ${isActive ? 'bg-blue-800 border-l-4 border-blue-300' : ''}`
          }
        >
          <AlertTriangle className="h-5 w-5 mr-3" />
          <span>Fraud Explainer</span>
        </NavLink>
        <NavLink
          to="/risk-profile"
          className={({ isActive }) =>
            `flex items-center py-3 px-6 hover:bg-blue-800 transition-colors ${isActive ? 'bg-blue-800 border-l-4 border-blue-300' : ''}`
          }
        >
          <Users className="h-5 w-5 mr-3" />
          <span>Risk Profile</span>
        </NavLink>
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-xs uppercase tracking-wide text-blue-300 font-semibold">Analytics</h2>
        </div>
        <NavLink
          to="/performance"
          className={({ isActive }) =>
            `flex items-center py-3 px-6 hover:bg-blue-800 transition-colors ${isActive ? 'bg-blue-800 border-l-4 border-blue-300' : ''}`
          }
        >
          <BarChart4 className="h-5 w-5 mr-3" />
          <span>Performance</span>
        </NavLink>
        <NavLink
          to="/demo"
          className={({ isActive }) =>
            `flex items-center py-3 px-6 hover:bg-blue-800 transition-colors ${isActive ? 'bg-blue-800 border-l-4 border-blue-300' : ''}`
          }
        >
          <BarChart4 className="h-5 w-5 mr-3" />
          <span>Demo Dashboard</span>
        </NavLink>
        <div className="px-6 pt-6 pb-2">
          <h2 className="text-xs uppercase tracking-wide text-blue-300 font-semibold">Settings</h2>
        </div>
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center py-3 px-6 hover:bg-blue-800 transition-colors ${isActive ? 'bg-blue-800 border-l-4 border-blue-300' : ''}`
          }
        >
          <Settings className="h-5 w-5 mr-3" />
          <span>Configuration</span>
        </NavLink>
      </nav>

      <div className="absolute bottom-0 w-64 bg-blue-950 p-4">
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
    </aside>
  );
};

export default Sidebar;
