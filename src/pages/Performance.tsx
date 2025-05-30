import React from 'react';
import { BarChart4, TrendingUp, TrendingDown, Users } from 'lucide-react';
import StatsCard from '../components/StatsCard';
import MobileSidebar from '../components/MobileSidebar';

const Performance = () => {
  return (
    <>
      <MobileSidebar />
      <div className="space-y-6">
        <div className="flex items-center space-x-2 mb-6">
          <div className="p-2 bg-purple-100 rounded-lg text-purple-700">
            <BarChart4 className="h-6 w-6" />
          </div>
          <h1 className="text-2xl font-bold text-gray-800">Performance Analytics</h1>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard
            title="Total Agent Runs"
            value="1,284"
            icon={<Users className="h-5 w-5" />}
            change={{ value: 12.5, isPositive: true }}
            bgColor="bg-white"
          />
          <StatsCard
            title="Success Rate"
            value="92.3%"
            icon={<TrendingUp className="h-5 w-5" />}
            change={{ value: 2.1, isPositive: true }}
            bgColor="bg-white"
          />
          <StatsCard
            title="Avg Response Time"
            value="1.2s"
            icon={<TrendingDown className="h-5 w-5" />}
            change={{ value: 0.3, isPositive: true }}
            bgColor="bg-white"
          />
          <StatsCard
            title="User Satisfaction"
            value="4.8/5"
            icon={<Users className="h-5 w-5" />}
            change={{ value: 0.2, isPositive: true }}
            bgColor="bg-white"
          />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Agent Performance Trends</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-500">Performance chart will be displayed here</p>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-4">Response Time Distribution</h2>
            <div className="h-64 flex items-center justify-center bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-gray-500">Response time chart will be displayed here</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-md border border-gray-200 p-6">
          <h2 className="text-lg font-semibold text-gray-800 mb-4">Agent-wise Metrics</h2>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Agent
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Success Rate
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Avg Response Time
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total Runs
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Fraud Explainer</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">94.2%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">1.1s</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">723</div>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">Risk Profile Generator</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">90.5%</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">1.3s</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">561</div>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
};

export default Performance;
