import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import KPICards from '../components/dashboard/KPICards';
import ResponseTimeChart from '../components/charts/ResponseTimeChart';
import ThroughputChart from '../components/charts/ThroughputChart';
import ErrorRateChart from '../components/charts/ErrorRateChart';
import DistributionChart from '../components/charts/DistributionChart';
import ErrorBreakdownChart from '../components/charts/ErrorBreakdownChart';
import ThreadsChart from '../components/charts/ThreadsChart';
import ChartCard from '../components/charts/ChartCard';
import { formatBytes, formatMs } from '../lib/utils';

export default function OverviewTab() {
  const { state } = useContext(AppContext);
  const { stats } = state;

  if (!stats) return null;

  return (
    <div className="space-y-6 animate-fade-in">
      <KPICards />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ResponseTimeChart />
        <ThroughputChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <ErrorRateChart />
        <DistributionChart />
        <ErrorBreakdownChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThreadsChart />
        
        {/* Bytes Summary Card */}
        <ChartCard title="Network & Duration Summary" exportable={false} className="h-[250px]">
          <div className="grid grid-cols-2 gap-4 h-full pt-4">
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 flex flex-col justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Received</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatBytes(stats.totalBytes)}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 flex flex-col justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Total Sent</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatBytes(stats.totalSentBytes)}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 flex flex-col justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Avg per Request</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatBytes(stats.avgBytes)}</span>
            </div>
            <div className="bg-gray-50 dark:bg-gray-800/50 rounded-lg p-4 flex flex-col justify-center">
              <span className="text-sm text-gray-500 dark:text-gray-400 mb-1">Test Duration</span>
              <span className="text-2xl font-bold text-gray-900 dark:text-gray-100">{formatMs(stats.durationSec * 1000)}</span>
            </div>
          </div>
        </ChartCard>
      </div>
    </div>
  );
}
