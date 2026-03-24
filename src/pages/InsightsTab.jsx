import React, { useContext } from 'react';
import { Lightbulb } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import InsightsPanel from '../components/insights/InsightsPanel';

export default function InsightsTab() {
  const { state } = useContext(AppContext);
  const { insights } = state;

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Lightbulb className="text-brand-500" />
          Automated Insights
          {insights && insights.length > 0 && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full ml-2">
              {insights.length} issues found
            </span>
          )}
        </h2>
      </div>
      
      <p className="text-gray-600 dark:text-gray-300 max-w-3xl">
        These insights are automatically generated based on common performance patterns and anti-patterns. 
        They highlight areas that may require your attention, such as high error rates, slow endpoints, or unusual latency spikes.
      </p>

      <InsightsPanel />
    </div>
  );
}
