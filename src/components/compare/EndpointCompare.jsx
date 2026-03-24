import React, { useContext } from 'react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';
import { X } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { COLORS, formatMs, formatNumber, formatPercent } from '../../lib/utils';
import ChartCard from '../charts/ChartCard';

export default function EndpointCompare() {
  const { state, dispatch } = useContext(AppContext);
  const { compareEndpoints, perLabelStats, theme } = state;

  if (compareEndpoints.length === 0) {
    return (
      <div className="glass rounded-xl p-8 flex flex-col items-center justify-center text-center border-dashed mb-6">
        <div className="w-16 h-16 rounded-full bg-brand-100 dark:bg-brand-900/30 flex items-center justify-center mb-4">
          <svg className="w-8 h-8 text-brand-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">Compare Endpoints</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          Select up to 4 endpoints from the table below using the checkboxes to compare their performance profiles side-by-side.
        </p>
      </div>
    );
  }

  const isDark = theme === 'dark';
  
  // Get stats for selected endpoints
  const selectedStats = compareEndpoints.map(label => 
    perLabelStats.find(s => s.label === label)
  ).filter(Boolean);

  // Prepare normalized data for radar chart
  // We need to normalize values so they fit on the same radar scale (0-100)
  const maxValues = {
    avg: Math.max(...selectedStats.map(s => s.avg), 1),
    p95: Math.max(...selectedStats.map(s => s.p95), 1),
    p99: Math.max(...selectedStats.map(s => s.p99), 1),
    throughput: Math.max(...selectedStats.map(s => s.throughput), 1),
    failRate: Math.max(...selectedStats.map(s => s.failRate), 1),
  };

  const radarData = [
    { subject: 'Avg RT', ...selectedStats.reduce((acc, s, i) => ({ ...acc, [`Endpoint ${i+1}`]: (s.avg / maxValues.avg) * 100, [`raw_${i+1}`]: s.avg }), {}) },
    { subject: 'P95 RT', ...selectedStats.reduce((acc, s, i) => ({ ...acc, [`Endpoint ${i+1}`]: (s.p95 / maxValues.p95) * 100, [`raw_${i+1}`]: s.p95 }), {}) },
    { subject: 'P99 RT', ...selectedStats.reduce((acc, s, i) => ({ ...acc, [`Endpoint ${i+1}`]: (s.p99 / maxValues.p99) * 100, [`raw_${i+1}`]: s.p99 }), {}) },
    { subject: 'Throughput', ...selectedStats.reduce((acc, s, i) => ({ ...acc, [`Endpoint ${i+1}`]: (s.throughput / maxValues.throughput) * 100, [`raw_${i+1}`]: s.throughput }), {}) },
    { subject: 'Error Rate', ...selectedStats.reduce((acc, s, i) => ({ ...acc, [`Endpoint ${i+1}`]: (s.failRate / maxValues.failRate) * 100, [`raw_${i+1}`]: s.failRate }), {}) },
  ];

  const removeEndpoint = (label) => {
    dispatch({ type: 'TOGGLE_COMPARE_ENDPOINT', payload: label });
  };

  return (
    <div className="mb-6 space-y-4 animate-fade-in">
      {/* Selected tags */}
      <div className="flex flex-wrap gap-2">
        {selectedStats.map((stat, i) => (
          <div 
            key={stat.label} 
            className="flex items-center gap-2 px-3 py-1.5 rounded-full text-sm font-medium border"
            style={{ 
              backgroundColor: isDark ? `${COLORS[i]}20` : `${COLORS[i]}10`,
              borderColor: `${COLORS[i]}40`,
              color: isDark ? '#f3f4f6' : '#111827'
            }}
          >
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }}></div>
            <span className="truncate max-w-[200px]" title={stat.label}>{stat.label}</span>
            <button 
              onClick={() => removeEndpoint(stat.label)}
              className="ml-1 p-0.5 rounded-full hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
            >
              <X size={14} />
            </button>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Radar Chart */}
        <ChartCard title="Performance Profile" className="lg:col-span-1 h-[400px]">
          <ResponsiveContainer width="100%" height="100%">
            <RadarChart cx="50%" cy="50%" outerRadius="70%" data={radarData}>
              <PolarGrid stroke={isDark ? '#374151' : '#e5e7eb'} />
              <PolarAngleAxis dataKey="subject" tick={{ fill: isDark ? '#9ca3af' : '#4b5563', fontSize: 12 }} />
              <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
              <Tooltip 
                formatter={(value, name, props) => {
                  const index = parseInt(name.replace('Endpoint ', '')) - 1;
                  const rawValue = props.payload[`raw_${index + 1}`];
                  const subject = props.payload.subject;
                  
                  let formatted = rawValue;
                  if (subject.includes('RT')) formatted = formatMs(rawValue);
                  else if (subject === 'Throughput') formatted = `${rawValue.toFixed(1)}/s`;
                  else if (subject === 'Error Rate') formatted = formatPercent(rawValue);
                  
                  return [formatted, selectedStats[index].label];
                }}
                contentStyle={{ 
                  backgroundColor: isDark ? '#1f2937' : '#ffffff',
                  borderColor: isDark ? '#374151' : '#e5e7eb',
                  color: isDark ? '#f3f4f6' : '#111827',
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                }}
              />
              <Legend 
                formatter={(value) => {
                  const index = parseInt(value.replace('Endpoint ', '')) - 1;
                  const label = selectedStats[index]?.label || value;
                  return label.length > 20 ? label.substring(0, 17) + '...' : label;
                }}
                wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }}
              />
              {selectedStats.map((_, i) => (
                <Radar 
                  key={`radar-${i}`}
                  name={`Endpoint ${i+1}`} 
                  dataKey={`Endpoint ${i+1}`} 
                  stroke={COLORS[i]} 
                  fill={COLORS[i]} 
                  fillOpacity={0.3} 
                />
              ))}
            </RadarChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Comparison Table */}
        <div className="lg:col-span-2 glass rounded-xl overflow-hidden flex flex-col">
          <div className="p-4 border-b border-gray-200 dark:border-gray-800">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Detailed Metrics</h3>
          </div>
          <div className="overflow-x-auto flex-1">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 uppercase">
                <tr>
                  <th className="px-4 py-3 font-medium">Metric</th>
                  {selectedStats.map((stat, i) => (
                    <th key={`th-${i}`} className="px-4 py-3 font-medium" style={{ color: COLORS[i] }}>
                      <div className="truncate max-w-[150px]" title={stat.label}>{stat.label}</div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Total Requests</td>
                  {selectedStats.map((s, i) => <td key={i} className="px-4 py-3">{formatNumber(s.total)}</td>)}
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Success Rate</td>
                  {selectedStats.map((s, i) => (
                    <td key={i} className={`px-4 py-3 ${s.successRate < 95 ? 'text-red-500' : 'text-emerald-500'}`}>
                      {formatPercent(s.successRate)}
                    </td>
                  ))}
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Average Response</td>
                  {selectedStats.map((s, i) => <td key={i} className="px-4 py-3">{formatMs(s.avg)}</td>)}
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Median</td>
                  {selectedStats.map((s, i) => <td key={i} className="px-4 py-3">{formatMs(s.median)}</td>)}
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">90th Percentile</td>
                  {selectedStats.map((s, i) => <td key={i} className="px-4 py-3">{formatMs(s.p90)}</td>)}
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">95th Percentile</td>
                  {selectedStats.map((s, i) => <td key={i} className="px-4 py-3">{formatMs(s.p95)}</td>)}
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">99th Percentile</td>
                  {selectedStats.map((s, i) => <td key={i} className="px-4 py-3">{formatMs(s.p99)}</td>)}
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Min / Max</td>
                  {selectedStats.map((s, i) => <td key={i} className="px-4 py-3 text-gray-500 dark:text-gray-400">{Math.round(s.min)} / {Math.round(s.max)}</td>)}
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Throughput</td>
                  {selectedStats.map((s, i) => <td key={i} className="px-4 py-3">{s.throughput.toFixed(2)}/s</td>)}
                </tr>
                <tr className="hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                  <td className="px-4 py-3 font-medium text-gray-900 dark:text-gray-100">Std Deviation</td>
                  {selectedStats.map((s, i) => <td key={i} className="px-4 py-3">{formatMs(s.stdDev)}</td>)}
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
