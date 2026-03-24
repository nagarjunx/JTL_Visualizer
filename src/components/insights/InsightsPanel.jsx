import React, { useContext } from 'react';
import { AlertTriangle, TrendingDown, Shield, Zap, Wifi, CheckCircle2, Lightbulb } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export default function InsightsPanel() {
  const { state } = useContext(AppContext);
  const { insights } = state;

  if (!insights) return null;

  if (insights.length === 0) {
    return (
      <div className="glass rounded-xl p-8 flex flex-col items-center justify-center text-center border-dashed">
        <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-900/30 flex items-center justify-center mb-4">
          <CheckCircle2 size={32} className="text-emerald-500" />
        </div>
        <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-2">All Clear</h3>
        <p className="text-gray-500 dark:text-gray-400 max-w-md">
          No significant performance or reliability issues were detected in this test run.
        </p>
      </div>
    );
  }

  const getSeverityColor = (severity) => {
    switch (severity) {
      case 'high': return 'border-red-500 bg-red-50 dark:bg-red-900/10';
      case 'medium': return 'border-amber-500 bg-amber-50 dark:bg-amber-900/10';
      case 'low': return 'border-blue-500 bg-blue-50 dark:bg-blue-900/10';
      default: return 'border-gray-500 bg-gray-50 dark:bg-gray-900/10';
    }
  };

  const getSeverityBadge = (severity) => {
    switch (severity) {
      case 'high': return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'medium': return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'low': return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300';
    }
  };

  const getCategoryIcon = (category) => {
    switch (category) {
      case 'performance': return <Zap size={20} className="text-amber-500" />;
      case 'reliability': return <Shield size={20} className="text-red-500" />;
      case 'errors': return <AlertTriangle size={20} className="text-red-500" />;
      case 'stability': return <TrendingDown size={20} className="text-purple-500" />;
      case 'network': return <Wifi size={20} className="text-blue-500" />;
      case 'positive': return <CheckCircle2 size={20} className="text-emerald-500" />;
      default: return <Lightbulb size={20} className="text-gray-500" />;
    }
  };

  const highCount = insights.filter(i => i.severity === 'high').length;
  const medCount = insights.filter(i => i.severity === 'medium').length;
  const lowCount = insights.filter(i => i.severity === 'low').length;

  return (
    <div className="space-y-6">
      {/* Summary Card */}
      <div className="glass rounded-xl p-4 flex flex-wrap gap-4 items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Automated Insights</h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Found {insights.length} potential areas for investigation
          </p>
        </div>
        <div className="flex gap-3">
          {highCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300 rounded-lg text-sm font-medium">
              <AlertTriangle size={16} />
              <span>{highCount} Critical</span>
            </div>
          )}
          {medCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 rounded-lg text-sm font-medium">
              <AlertTriangle size={16} />
              <span>{medCount} Warning</span>
            </div>
          )}
          {lowCount > 0 && (
            <div className="flex items-center gap-1.5 px-3 py-1.5 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-300 rounded-lg text-sm font-medium">
              <Lightbulb size={16} />
              <span>{lowCount} Info</span>
            </div>
          )}
        </div>
      </div>

      {/* Insight Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <div 
            key={index} 
            className={cn(
              "rounded-xl border-l-4 p-5 shadow-sm transition-all duration-300 hover:shadow-md animate-slide-up",
              getSeverityColor(insight.severity),
              "border-t border-r border-b border-gray-200 dark:border-gray-800"
            )}
            style={{ animationDelay: `${index * 80}ms`, animationFillMode: 'both' }}
          >
            <div className="flex items-start gap-3 mb-3">
              <div className="mt-0.5 p-1.5 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
                {getCategoryIcon(insight.category)}
              </div>
              <div className="flex-1">
                <div className="flex items-center justify-between gap-2 mb-1">
                  <h4 className="font-semibold text-gray-900 dark:text-gray-100">{insight.title}</h4>
                  <span className={cn("text-xs px-2 py-0.5 rounded-full font-medium uppercase tracking-wider", getSeverityBadge(insight.severity))}>
                    {insight.severity}
                  </span>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-300 leading-relaxed">
                  {insight.description}
                </p>
              </div>
            </div>
            
            {insight.recommendation && (
              <div className="mt-4 ml-11 p-3 bg-white/60 dark:bg-gray-800/60 rounded-lg border border-gray-100 dark:border-gray-700">
                <div className="flex items-start gap-2">
                  <Lightbulb size={16} className="text-amber-500 mt-0.5 shrink-0" />
                  <p className="text-sm text-gray-700 dark:text-gray-200">
                    <span className="font-medium mr-1">Recommendation:</span>
                    {insight.recommendation}
                  </p>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
