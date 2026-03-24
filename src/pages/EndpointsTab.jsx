import React, { useContext, useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, Target, BarChart2 } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { formatNumber, formatMs, formatPercent, cn } from '../lib/utils';
import EndpointCompare from '../components/compare/EndpointCompare';
import ChartCard from '../components/charts/ChartCard';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import LatencyCompareChart from '../components/charts/LatencyCompareChart';

export default function EndpointsTab() {
  const { state, dispatch } = useContext(AppContext);
  const { perLabelStats, compareEndpoints, theme } = state;

  const [sortConfig, setSortConfig] = useState({ key: 'total', direction: 'desc' });
  const [isCompareMode, setIsCompareMode] = useState(false);

  const sortedData = useMemo(() => {
    if (!perLabelStats) return [];
    let sortableItems = [...perLabelStats];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal < bVal) return sortConfig.direction === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }
    return sortableItems;
  }, [perLabelStats, sortConfig]);

  if (!perLabelStats || perLabelStats.length === 0) return null;

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleRowClick = (label) => {
    if (isCompareMode) return;
    dispatch({ type: 'SET_FILTERS', payload: { labels: [label] } });
    dispatch({ type: 'SET_ACTIVE_TAB', payload: 'requests' });
  };

  const toggleCompare = (label, e) => {
    e.stopPropagation();
    dispatch({ type: 'TOGGLE_COMPARE_ENDPOINT', payload: label });
  };

  const isDark = theme === 'dark';

  // Top 10 slowest endpoints by P95
  const slowestEndpoints = [...perLabelStats]
    .sort((a, b) => b.p95 - a.p95)
    .slice(0, 10)
    .map(s => ({
      name: s.label.length > 25 ? s.label.substring(0, 22) + '...' : s.label,
      fullLabel: s.label,
      p95: Math.round(s.p95)
    }));

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Target className="text-brand-500" />
          Endpoint Statistics
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full ml-2">
            {perLabelStats.length} endpoints
          </span>
        </h2>
        
        <button
          onClick={() => setIsCompareMode(!isCompareMode)}
          className={cn(
            "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg transition-colors",
            isCompareMode 
              ? "bg-brand-100 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 border border-brand-200 dark:border-brand-800" 
              : "bg-white text-gray-700 border border-gray-300 hover:bg-gray-50 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700"
          )}
        >
          <BarChart2 size={16} />
          <span>{isCompareMode ? 'Exit Compare Mode' : 'Compare Endpoints'}</span>
        </button>
      </div>

      {isCompareMode && <EndpointCompare />}

      {!isCompareMode && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartCard title="Slowest Endpoints" subtitle="Top 10 by 95th Percentile" className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart 
                data={slowestEndpoints} 
                layout="vertical" 
                margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} horizontal={false} />
                <XAxis 
                  type="number" 
                  tickFormatter={(val) => `${val}ms`} 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  type="category" 
                  dataKey="name" 
                  stroke={isDark ? '#9ca3af' : '#6b7280'}
                  tick={{ fontSize: 11 }}
                  width={120}
                />
                <Tooltip 
                  formatter={(value) => [formatMs(value), '95th Percentile']}
                  labelFormatter={(label, payload) => {
                    if (payload && payload.length > 0) return payload[0].payload.fullLabel;
                    return label;
                  }}
                  contentStyle={{ 
                    backgroundColor: isDark ? '#1f2937' : '#ffffff',
                    borderColor: isDark ? '#374151' : '#e5e7eb',
                    color: isDark ? '#f3f4f6' : '#111827',
                    borderRadius: '0.5rem',
                    boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                  }}
                />
                <Bar dataKey="p95" name="95th Percentile" fill="#f59e0b" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </ChartCard>
          
          <LatencyCompareChart />
        </div>
      )}

      <div className="glass rounded-xl overflow-hidden flex flex-col">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 uppercase border-b border-gray-200 dark:border-gray-800">
              <tr>
                {isCompareMode && <th className="px-4 py-3 font-medium w-10 text-center">Compare</th>}
                {[
                  { key: 'label', label: 'Endpoint' },
                  { key: 'total', label: 'Requests' },
                  { key: 'successRate', label: 'Success %' },
                  { key: 'avg', label: 'Avg' },
                  { key: 'median', label: 'Median' },
                  { key: 'p90', label: 'P90' },
                  { key: 'p95', label: 'P95' },
                  { key: 'p99', label: 'P99' },
                  { key: 'min', label: 'Min' },
                  { key: 'max', label: 'Max' },
                  { key: 'throughput', label: 'Req/s' },
                ].map((col) => (
                  <th 
                    key={col.key} 
                    className={cn(
                      "px-4 py-3 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none group",
                      col.key !== 'label' && "text-right"
                    )}
                    onClick={() => requestSort(col.key)}
                  >
                    <div className={cn("flex items-center gap-1", col.key !== 'label' && "justify-end")}>
                      {col.label}
                      <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                        {getSortIcon(col.key) || <ChevronUp size={14} className="opacity-30" />}
                      </span>
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {sortedData.map((row, idx) => {
                const isSelected = compareEndpoints.includes(row.label);
                const isDisabled = !isSelected && compareEndpoints.length >= 4;
                
                return (
                  <tr 
                    key={idx} 
                    onClick={() => handleRowClick(row.label)}
                    className={cn(
                      "transition-colors",
                      isCompareMode ? "" : "cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-800/50",
                      isSelected && isCompareMode ? "bg-brand-50/50 dark:bg-brand-900/10" : ""
                    )}
                  >
                    {isCompareMode && (
                      <td className="px-4 py-3 text-center" onClick={(e) => e.stopPropagation()}>
                        <input 
                          type="checkbox" 
                          checked={isSelected}
                          disabled={isDisabled}
                          onChange={(e) => toggleCompare(row.label, e)}
                          className="w-4 h-4 text-brand-600 bg-gray-100 border-gray-300 rounded focus:ring-brand-500 dark:focus:ring-brand-600 dark:ring-offset-gray-800 focus:ring-2 dark:bg-gray-700 dark:border-gray-600 disabled:opacity-50 cursor-pointer"
                        />
                      </td>
                    )}
                    <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100 truncate max-w-[300px]" title={row.label}>
                      {row.label}
                    </td>
                    <td className="px-4 py-3 text-right">{formatNumber(row.total)}</td>
                    <td className={cn(
                      "px-4 py-3 text-right font-medium",
                      row.successRate < 95 ? "text-red-500" : row.successRate < 100 ? "text-amber-500" : "text-emerald-500"
                    )}>
                      {formatPercent(row.successRate)}
                    </td>
                    <td className="px-4 py-3 text-right">{formatMs(row.avg)}</td>
                    <td className="px-4 py-3 text-right">{formatMs(row.median)}</td>
                    <td className="px-4 py-3 text-right">{formatMs(row.p90)}</td>
                    <td className="px-4 py-3 text-right text-amber-600 dark:text-amber-400 font-medium">{formatMs(row.p95)}</td>
                    <td className="px-4 py-3 text-right text-red-600 dark:text-red-400 font-medium">{formatMs(row.p99)}</td>
                    <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{Math.round(row.min)}</td>
                    <td className="px-4 py-3 text-right text-gray-500 dark:text-gray-400">{Math.round(row.max)}</td>
                    <td className="px-4 py-3 text-right font-medium text-cyan-600 dark:text-cyan-400">{row.throughput.toFixed(1)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
