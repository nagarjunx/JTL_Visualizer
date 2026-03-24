import React, { useContext } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppContext } from '../../context/AppContext';
import { formatTimestamp } from '../../lib/utils';
import ChartCard from './ChartCard';

export default function ErrorRateChart() {
  const { state } = useContext(AppContext);
  const { timeSeries, theme } = state;

  if (!timeSeries || timeSeries.length === 0) {
    return (
      <ChartCard title="Error Rate" className="h-[250px]">
        <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
      </ChartCard>
    );
  }

  const isDark = theme === 'dark';

  return (
    <ChartCard title="Error Rate" subtitle="Percentage of failed requests" className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <defs>
            <linearGradient id="colorError" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
              <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
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
            tickFormatter={(val) => `${val}%`} 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 12 }}
            width={60}
          />
          <Tooltip 
            labelFormatter={formatTimestamp}
            formatter={(value) => [`${value.toFixed(2)}%`, 'Error Rate']}
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb',
              color: isDark ? '#f3f4f6' : '#111827',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Area 
            type="monotone" 
            dataKey="errorRate" 
            name="Error Rate" 
            stroke="#ef4444" 
            fillOpacity={1} 
            fill="url(#colorError)" 
          />
        </AreaChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
