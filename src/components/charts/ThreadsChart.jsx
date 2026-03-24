import React, { useContext } from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppContext } from '../../context/AppContext';
import { formatTimestamp } from '../../lib/utils';
import ChartCard from './ChartCard';

export default function ThreadsChart() {
  const { state } = useContext(AppContext);
  const { timeSeries, theme } = state;

  // Only render if thread data exists
  const hasThreads = timeSeries && timeSeries.some(t => t.activeThreads > 0);

  if (!hasThreads) {
    return null;
  }

  const isDark = theme === 'dark';

  return (
    <ChartCard title="Active Threads" subtitle="Concurrent users over time" className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <LineChart data={timeSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
          <XAxis 
            dataKey="time" 
            tickFormatter={formatTimestamp} 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 12 }}
            minTickGap={30}
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 12 }}
            width={60}
          />
          <Tooltip 
            labelFormatter={formatTimestamp}
            formatter={(value) => [value, 'Active Threads']}
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb',
              color: isDark ? '#f3f4f6' : '#111827',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Line 
            type="stepAfter" 
            dataKey="activeThreads" 
            name="Active Threads" 
            stroke="#06b6d4" 
            strokeWidth={2}
            dot={false}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
