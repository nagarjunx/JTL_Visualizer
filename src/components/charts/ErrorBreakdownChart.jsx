import React, { useContext } from 'react';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { AppContext } from '../../context/AppContext';
import { COLORS } from '../../lib/utils';
import ChartCard from './ChartCard';

export default function ErrorBreakdownChart() {
  const { state } = useContext(AppContext);
  const { errorBreakdown, theme } = state;

  const data = errorBreakdown?.topCodes?.slice(0, 8) || [];

  if (data.length === 0) {
    return (
      <ChartCard title="Error Breakdown" className="h-[250px]">
        <div className="flex items-center justify-center h-full text-gray-500">
          <div className="flex flex-col items-center">
            <div className="w-12 h-12 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-2">
              <svg className="w-6 h-6 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <span>No errors found</span>
          </div>
        </div>
      </ChartCard>
    );
  }

  const isDark = theme === 'dark';

  return (
    <ChartCard title="Error Breakdown" subtitle="Top error codes" className="h-[250px]">
      <ResponsiveContainer width="100%" height="100%">
        <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={40}
            outerRadius={80}
            paddingAngle={2}
            dataKey="count"
            nameKey="code"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip 
            formatter={(value, name) => [value, `Code ${name}`]}
            contentStyle={{ 
              backgroundColor: isDark ? '#1f2937' : '#ffffff',
              borderColor: isDark ? '#374151' : '#e5e7eb',
              color: isDark ? '#f3f4f6' : '#111827',
              borderRadius: '0.5rem',
              boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)'
            }}
          />
          <Legend 
            layout="vertical" 
            verticalAlign="middle" 
            align="right"
            wrapperStyle={{ fontSize: '12px', color: isDark ? '#d1d5db' : '#374151' }}
          />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
}
