import React, { useContext } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, Brush } from 'recharts';
import { AppContext } from '../../context/AppContext';
import { formatTimestamp, formatMs } from '../../lib/utils';
import ChartCard from './ChartCard';

export default function ResponseTimeChart({ showBrush = false }) {
  const { state } = useContext(AppContext);
  const { timeSeries, theme } = state;

  if (!timeSeries || timeSeries.length === 0) {
    return (
      <ChartCard title="Response Time Over Time" className="h-80">
        <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
      </ChartCard>
    );
  }

  const isDark = theme === 'dark';

  return (
    <ChartCard title="Response Time Over Time" className="h-[400px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorAvg" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorP95" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
          <XAxis 
            dataKey="time" 
            tickFormatter={formatTimestamp} 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 12 }}
            minTickGap={30}
          />
          <YAxis 
            tickFormatter={(val) => `${val}ms`} 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 12 }}
            width={60}
          />
          <Tooltip 
            labelFormatter={formatTimestamp}
            formatter={(value, name) => [formatMs(value), name]}
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb',
              color: isDark ? '#f3f4f6' : '#111827',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Legend wrapperStyle={{ paddingTop: '10px' }} />
          <Area 
            type="monotone" 
            dataKey="p95ResponseTime" 
            name="95th Percentile" 
            stroke="#f59e0b" 
            fillOpacity={1} 
            fill="url(#colorP95)" 
          />
          <Area 
            type="monotone" 
            dataKey="avgResponseTime" 
            name="Average" 
            stroke="#3b82f6" 
            fillOpacity={1} 
            fill="url(#colorAvg)" 
          />
          {showBrush && (
            <Brush 
              dataKey="time" 
              height={30} 
              stroke={isDark ? '#4b5563' : '#9ca3af'}
              fill={isDark ? '#1f2937' : '#f3f4f6'}
              tickFormatter={formatTimestamp}
            />
          )}
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
