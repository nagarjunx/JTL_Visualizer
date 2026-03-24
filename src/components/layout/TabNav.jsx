import React, { useContext } from 'react';
import { LayoutDashboard, TrendingUp, AlertTriangle, Target, List, Lightbulb, Database } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { cn } from '../../lib/utils';

export default function TabNav() {
  const { state, dispatch } = useContext(AppContext);
  const { activeTab } = state;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'trends', label: 'Trends', icon: TrendingUp },
    { id: 'errors', label: 'Errors', icon: AlertTriangle },
    { id: 'endpoints', label: 'Endpoints', icon: Target },
    { id: 'requests', label: 'Requests', icon: List },
    { id: 'insights', label: 'Insights', icon: Lightbulb },
    { id: 'raw', label: 'Raw Data', icon: Database },
  ];

  return (
    <div className="sticky top-16 z-40 bg-white dark:bg-gray-950 border-b border-gray-200 dark:border-gray-800 transition-colors">
      <div className="container mx-auto px-4">
        <nav className="flex space-x-1 overflow-x-auto py-3 scrollbar-hide" aria-label="Tabs">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => dispatch({ type: 'SET_ACTIVE_TAB', payload: tab.id })}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 text-sm font-medium rounded-lg whitespace-nowrap transition-all duration-200",
                  isActive
                    ? "bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-400 shadow-sm"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50 dark:text-gray-400 dark:hover:text-gray-200 dark:hover:bg-gray-800/50"
                )}
                aria-current={isActive ? 'page' : undefined}
              >
                <Icon size={18} className={cn(isActive ? "text-brand-600 dark:text-brand-400" : "text-gray-400 dark:text-gray-500")} />
                <span className="hidden sm:inline">{tab.label}</span>
              </button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
