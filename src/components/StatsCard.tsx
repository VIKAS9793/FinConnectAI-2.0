import React from 'react';

interface StatsCardProps {
  title: string;
  value: string | number;
  icon: React.ReactNode;
  change?: {
    value: number;
    isPositive: boolean;
  };
  bgColor?: string;
  textColor?: string;
}

const StatsCard: React.FC<StatsCardProps> = ({ 
  title, 
  value, 
  icon, 
  change,
  bgColor = 'bg-white',
  textColor = 'text-gray-800'
}) => {
  return (
    <div className={`${bgColor} rounded-lg shadow-md border border-gray-200 p-5`}>
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <p className={`text-2xl font-bold ${textColor} mt-1`}>{value}</p>
          
          {change && (
            <div className="flex items-center mt-2">
              <span className={`text-xs font-medium ${change.isPositive ? 'text-green-500' : 'text-red-500'}`}>
                {change.isPositive ? '+' : ''}{change.value}%
              </span>
              <span className="text-xs text-gray-500 ml-1">vs last month</span>
            </div>
          )}
        </div>
        
        <div className="p-2 rounded-lg bg-blue-50 text-blue-700">
          {icon}
        </div>
      </div>
    </div>
  );
};

export default StatsCard;