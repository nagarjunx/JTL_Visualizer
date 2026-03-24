import React, { useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AppContext } from '../../context/AppContext';
import { formatMs } from '../../lib/utils';
import ChartCard from './ChartCard';

export default function LatencyCompareChart() {
  const { state } = useContext(AppContext);
  const { perLabelStats, theme } = state;

  if (!perLabelStats || perLabelStats.length === 0) {
    return (
      <ChartCard title="Endpoint Latency Comparison" className="h-80">
        <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
      </ChartCard>
    );
  }

  // Take top 15 endpoints by total requests
  const data = perLabelStats.slice(0, 15).map(s => ({
    name: s.label.length > 30 ? s.label.substring(0, 27) + '...' : s.label,
    fullLabel: s.label,
    avg: Math.round(s.avg),
    p95: Math.round(s.p95),
    p99: Math.round(s.p99)
  }));

  const isDark = theme === 'dark';
  const height = Math.max(300, data.length * 40 + 60);

  return (
    <ChartCard title="Endpoint Latency Comparison" subtitle="Top 15 endpoints by volume" className={`h-[${height}px] min-h-[300px]`}>
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={data} 
          layout="vertical" 
          margin={{ top: 10, right: 30, left: 10, bottom: 5 }}
          barGap={2}
          barSize={10}
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
            width={150}
          />
          <Tooltip 
            formatter={(value) => [formatMs(value)]}
            labelFormatter={(label, payload) => {
              if (payload && payload.length > 0) {
                return payload[0].payload.fullLabel;
              }
              return label;
            }}
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb',
              color: isDark ? '#f3f4f6' : '#111827',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Bar dataKey="avg" name="Average" fill="#3b82f6" radius={[0, 4, 4, 0]} />
          <Bar dataKey="p95" name="95th Percentile" fill="#f59e0b" radius={[0, 4, 4, 0]} />
          <Bar dataKey="p99" name="99th Percentile" fill="#ef4444" radius={[0, 4, 4, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
