import React, { useContext } from 'react';
import { AlertTriangle, XCircle, FileText, Activity } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import ErrorRateChart from '../components/charts/ErrorRateChart';
import ErrorBreakdownChart from '../components/charts/ErrorBreakdownChart';
import ChartCard from '../components/charts/ChartCard';
import { formatNumber, formatPercent, cn } from '../lib/utils';

export default function ErrorsTab() {
  const { state, dispatch } = useContext(AppContext);
  const { stats, errorBreakdown, perLabelStats } = state;

  if (!stats || !errorBreakdown) return null;

  const handleEndpointClick = (label) => {
    dispatch({ type: 'SET_FILTERS', payload: { labels: [label], success: false } });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'requests' });
  };

  const topMessages = errorBreakdown.topMessages.slice(0, 15);
  const failedEndpoints = perLabelStats.filter(s => s.failCount > 0).sort((a, b) => b.failRate - a.failRate);

  return (
    <div className="space-y-6 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="glass rounded-xl p-4 flex flex-col justify-between card-hover">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Total Errors</h3>
            <div className="p-1.5 rounded-lg bg-red-100 text-red-500 dark:bg-red-900/30">
              <XCircle size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {formatNumber(stats.failCount)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              out of {formatNumber(stats.total)} requests
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 flex flex-col justify-between card-hover">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Error Rate</h3>
            <div className="p-1.5 rounded-lg bg-amber-100 text-amber-500 dark:bg-amber-900/30">
              <Activity size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {formatPercent(stats.failRate)}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              overall failure percentage
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 flex flex-col justify-between card-hover">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unique Error Codes</h3>
            <div className="p-1.5 rounded-lg bg-purple-100 text-purple-500 dark:bg-purple-900/30">
              <AlertTriangle size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {errorBreakdown.topCodes.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              distinct HTTP status codes
            </div>
          </div>
        </div>

        <div className="glass rounded-xl p-4 flex flex-col justify-between card-hover">
          <div className="flex justify-between items-start mb-2">
            <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">Unique Messages</h3>
            <div className="p-1.5 rounded-lg bg-blue-100 text-blue-500 dark:bg-blue-900/30">
              <FileText size={16} />
            </div>
          </div>
          <div>
            <div className="text-2xl font-bold text-gray-900 dark:text-gray-100 truncate">
              {errorBreakdown.topMessages.length}
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
              distinct error messages
            </div>
          </div>
        </div>
      </div>

      <ErrorRateChart />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ErrorBreakdownChart />
        
        {/* Top Error Messages */}
        <ChartCard title="Top Error Messages" exportable={false} className="h-[250px] overflow-hidden flex flex-col">
          <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
            {topMessages.length === 0 ? (
              <div className="flex items-center justify-center h-full text-gray-500">
                No error messages found
              </div>
            ) : (
              <div className="space-y-3 pt-2">
                {topMessages.map((msg, idx) => {
                  const percentage = (msg.count / stats.failCount) * 100;
                  return (
                    <div key={idx} className="relative">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="font-medium text-gray-700 dark:text-gray-300 truncate pr-4" title={msg.message}>
                          {msg.message || 'Unknown'}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 whitespace-nowrap">
                          {formatNumber(msg.count)} ({formatPercent(percentage, 1)})
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5">
                        <div 
                          className="bg-red-500 h-1.5 rounded-full" 
                          style={{ width: `${percentage}%` }}
                        ></div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </ChartCard>
      </div>

      {/* Most Failed Endpoints */}
      <div className="glass rounded-xl overflow-hidden flex flex-col">
        <div className="p-4 border-b border-gray-200 dark:border-gray-800">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Endpoints with Errors</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">Sorted by failure rate</p>
        </div>
        
        {failedEndpoints.length === 0 ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            No failed endpoints found.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 uppercase border-b border-gray-200 dark:border-gray-800">
                <tr>
                  <th className="px-4 py-3 font-medium">Endpoint</th>
                  <th className="px-4 py-3 font-medium text-right">Total Requests</th>
                  <th className="px-4 py-3 font-medium text-right">Failures</th>
                  <th className="px-4 py-3 font-medium text-right">Failure Rate</th>
                  <th className="px-4 py-3 font-medium text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                {failedEndpoints.map((endpoint, idx) => (
                  <tr key={idx} className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 truncate max-w-[300px]" title={endpoint.label}>
                      {endpoint.label}
                    </td>
                    <td className="px-4 py-3 text-right">{formatNumber(endpoint.total)}</td>
                    <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-medium">{formatNumber(endpoint.failCount)}</td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className={cn(
                          "font-medium",
                          endpoint.failRate > 10 ? "text-red-600 dark:text-red-400" : "text-amber-600 dark:text-amber-400"
                        )}>
                          {formatPercent(endpoint.failRate)}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleEndpointClick(endpoint.label)}
                        className="text-xs font-medium text-brand-600 dark:text-brand-400 hover:text-brand-800 dark:hover:text-brand-300 hover:underline"
                      >
                        View Errors
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
