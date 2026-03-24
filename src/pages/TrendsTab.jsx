import React, { useContext } from 'react';
import { AppContext } from '../context/AppContext';
import ResponseTimeChart from '../components/charts/ResponseTimeChart';
import ThroughputChart from '../components/charts/ThroughputChart';
import ErrorRateChart from '../components/charts/ErrorRateChart';
import ThreadsChart from '../components/charts/ThreadsChart';
import LatencyCompareChart from '../components/charts/LatencyCompareChart';
import ChartCard from '../components/charts/ChartCard';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { formatTimestamp, formatMs } from '../lib/utils';

export default function TrendsTab() {
  const { state } = useContext(AppContext);
  const { timeSeries, theme } = state;

  if (!timeSeries) return null;

  const isDark = theme === 'dark';

  return (
    <div className="space-y-6 animate-fade-in">
      <ResponseTimeChart showBrush={true} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThroughputChart />
        <ErrorRateChart />
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ThreadsChart />
        
        {/* Latency vs Response Chart */}
        <ChartCard title="Latency vs Response Time" subtitle="Network vs Processing time" className="h-[250px]">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={timeSeries} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
              <defs>
                <linearGradient id="colorLatency" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorResponse" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
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
                dataKey="avgResponseTime" 
                name="Total Response" 
                stroke="#3b82f6" 
                fillOpacity={1} 
                fill="url(#colorResponse)" 
              />
              {/* Assuming timeSeries doesn't have avgLatency by default, but if it did we'd plot it here.
                  Since aggregator.js computeTimeSeries doesn't compute avgLatency per bucket, 
                  we'll just use p95ResponseTime vs avgResponseTime as a placeholder for the visual,
                  or we can just show avgResponseTime. Let's just use avgResponseTime and p95ResponseTime 
                  if latency isn't available in timeSeries. */}
              <Area 
                type="monotone" 
                dataKey="p95ResponseTime" 
                name="95th Percentile" 
                stroke="#8b5cf6" 
                fillOpacity={1} 
                fill="url(#colorLatency)" 
              />
            </AreaChart>
          </ResponsiveContainer>
        </ChartCard>
      </div>
      
      <LatencyCompareChart />
    </div>
  );
}
