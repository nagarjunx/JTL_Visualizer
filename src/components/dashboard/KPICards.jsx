import React, { useContext } from 'react';
import { Activity, CheckCircle2, XCircle, Clock, Timer, Gauge, Zap, TrendingUp } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { formatNumber, formatMs, formatPercent } from '../../lib/utils';
import { cn } from '../../lib/utils';

export default function KPICards() {
  const { state } = useContext(AppContext);
  const { stats } = state;

  if (!stats) return null;

  const cards = [
    {
      title: 'Total Requests',
      value: formatNumber(stats.total),
      subValue: `${stats.durationSec.toFixed(1)}s duration`,
      icon: Activity,
      color: 'text-blue-500',
      bg: 'bg-blue-100 dark:bg-blue-900/30'
    },
    {
      title: 'Success Rate',
      value: formatPercent(stats.successRate),
      subValue: `${formatNumber(stats.successCount)} passed`,
      icon: CheckCircle2,
      color: 'text-emerald-500',
      bg: 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      title: 'Error Rate',
      value: formatPercent(stats.failRate),
      subValue: `${formatNumber(stats.failCount)} failed`,
      icon: XCircle,
      color: stats.failRate > 5 ? 'text-red-500' : stats.failRate > 0 ? 'text-amber-500' : 'text-emerald-500',
      bg: stats.failRate > 5 ? 'bg-red-100 dark:bg-red-900/30' : stats.failRate > 0 ? 'bg-amber-100 dark:bg-amber-900/30' : 'bg-emerald-100 dark:bg-emerald-900/30'
    },
    {
      title: 'Avg Response Time',
      value: formatMs(stats.avgResponseTime),
      subValue: `${formatMs(stats.medianResponseTime)} median`,
      icon: Clock,
      color: 'text-purple-500',
      bg: 'bg-purple-100 dark:bg-purple-900/30'
    },
    {
      title: '95th Percentile',
      value: formatMs(stats.p95),
      subValue: `${formatMs(stats.p99)} P99`,
      icon: Timer,
      color: 'text-amber-500',
      bg: 'bg-amber-100 dark:bg-amber-900/30'
    },
    {
      title: 'Throughput',
      value: `${stats.throughput.toFixed(1)}/s`,
      subValue: 'requests per sec',
      icon: Gauge,
      color: 'text-cyan-500',
      bg: 'bg-cyan-100 dark:bg-cyan-900/30'
    },
    {
      title: 'Min / Max',
      value: `${Math.round(stats.minResponseTime)} / ${Math.round(stats.maxResponseTime)}`,
      subValue: 'milliseconds',
      icon: Zap,
      color: 'text-pink-500',
      bg: 'bg-pink-100 dark:bg-pink-900/30'
    },
    {
      title: 'Avg Latency',
      value: formatMs(stats.avgLatency),
      subValue: `${formatMs(stats.avgConnect)} connect`,
      icon: TrendingUp,
      color: 'text-indigo-500',
      bg: 'bg-indigo-100 dark:bg-indigo-900/30'
    }
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 xl:grid-cols-8 gap-4 mb-6">
      {cards.map((card, index) => {
        const Icon = card.icon;
        return (
          <div 
            key={index} 
            className="glass rounded-xl p-4 flex flex-col justify-between card-hover animate-slide-up"
            style={{ animationDelay: `${index * 50}ms`, animationFillMode: 'both' }}
          >
            <div className="flex justify-between items-start mb-2">
              <h3 className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">{card.title}</h3>
              <div className={cn('p-1.5 rounded-lg', card.bg, card.color)}>
                <Icon size={16} />
              </div>
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900 dark:text-gray-100 truncate" title={card.value}>
                {card.value}
              </div>
              <div className="text-xs text-gray-500 dark:text-gray-400 mt-1 truncate" title={card.subValue}>
                {card.subValue}
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
