import React, { useContext } from 'react';
import { List } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import RequestTable from '../components/tables/RequestTable';
import ExportButtons from '../components/export/ExportButtons';

export default function RequestsTab() {
  const { state } = useContext(AppContext);
  const { filteredData, stats } = state;

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <List className="text-brand-500" />
          Individual Requests
          {stats && (
            <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full ml-2">
              {stats.total.toLocaleString()} requests {stats.total > 100000 ? '(Showing first 100,000)' : ''}
            </span>
          )}
        </h2>
        
        <ExportButtons />
      </div>
      
      <RequestTable />
    </div>
  );
}
