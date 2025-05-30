import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, Bot, Zap, Activity } from 'lucide-react';

interface AgentCardProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  stats: {
    successRate: number;
    averageRating: number;
    totalRuns: number;
  };
  status: 'online' | 'offline' | 'error';
  path: string;
}

const AgentCard: React.FC<AgentCardProps> = ({ title, description, icon, stats, status, path }) => {
  const navigate = useNavigate();

  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-gray-400';
      case 'error':
        return 'bg-red-500';
      default:
        return 'bg-gray-400';
    }
  };

  const getStatusText = () => {
    switch (status) {
      case 'online':
        return 'Online';
      case 'offline':
        return 'Offline';
      case 'error':
        return 'Error';
      default:
        return 'Unknown';
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
      <div className="p-5">
        <div className="flex justify-between items-start">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-100 rounded-lg text-blue-700">{icon}</div>
            <div>
              <h3 className="text-lg font-semibold text-gray-800">{title}</h3>
              <div className="flex items-center mt-1">
                <div className={`h-2.5 w-2.5 rounded-full ${getStatusColor()} mr-2`}></div>
                <p className="text-sm text-gray-500">{getStatusText()}</p>
              </div>
            </div>
          </div>
          <div className="flex space-x-2">
            <button
              onClick={() => navigate(path)}
              className="text-sm text-blue-600 hover:text-blue-800 flex items-center space-x-1 font-medium"
            >
              <span>View</span>
              <ArrowRight className="h-4 w-4" />
            </button>
          </div>
        </div>

        <p className="mt-3 text-sm text-gray-600">{description}</p>

        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-gray-100 pt-4">
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1 flex items-center justify-center">
              <Zap className="h-3 w-3 mr-1" /> Success Rate
            </p>
            <p className="text-lg font-semibold text-gray-800">{stats.successRate}%</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1 flex items-center justify-center">
              <Activity className="h-3 w-3 mr-1" /> Avg. Rating
            </p>
            <p className="text-lg font-semibold text-gray-800">{stats.averageRating.toFixed(1)}</p>
          </div>
          <div className="text-center">
            <p className="text-xs text-gray-500 mb-1 flex items-center justify-center">
              <Bot className="h-3 w-3 mr-1" /> Total Runs
            </p>
            <p className="text-lg font-semibold text-gray-800">{stats.totalRuns}</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AgentCard;
