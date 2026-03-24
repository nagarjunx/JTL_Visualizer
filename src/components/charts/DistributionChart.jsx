import React, { useContext } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { AppContext } from '../../context/AppContext';
import ChartCard from './ChartCard';

export default function DistributionChart() {
  const { state } = useContext(AppContext);
  const { distribution, theme } = state;

  if (!distribution || distribution.length === 0) {
    return (
      <ChartCard title="Response Time Distribution" className="h-[250px]">
        <div className="flex items-center justify-center h-full text-gray-500">No data available</div>
      </ChartCard>
    );
  }

  const isDark = theme === 'dark';

  return (
    <ChartCard title="Response Time Distribution" subtitle="Histogram of response times" className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={distribution} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke={isDark ? '#374151' : '#e5e7eb'} vertical={false} />
          <XAxis 
            dataKey="range" 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 10 }}
            minTickGap={20}
          />
          <YAxis 
            stroke={isDark ? '#9ca3af' : '#6b7280'}
            tick={{ fontSize: 12 }}
            width={60}
          />
          <Tooltip 
            formatter={(value) => [value, 'Requests']}
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb',
              color: isDark ? '#f3f4f6' : '#111827',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Bar dataKey="count" name="Requests" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
