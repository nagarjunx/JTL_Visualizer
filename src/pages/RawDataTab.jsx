import React, { useContext, useState, useMemo } from 'react';
import { Database, Search, Download, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { AppContext } from '../context/AppContext';
import { formatTimestamp, formatMs, formatBytes, downloadCSV, cn } from '../lib/utils';

export default function RawDataTab() {
  const { state, dispatch } = useContext(AppContext);
  const { filteredData, fileName } = state;

  const [localSearch, setLocalSearch] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 100;

  const displayData = useMemo(() => {
    if (!filteredData) return [];
    if (!localSearch) return filteredData;
    
    const s = localSearch.toLowerCase();
    return filteredData.filter(row => 
      (row.label && row.label.toLowerCase().includes(s)) ||
      (row.responseCode && row.responseCode.toLowerCase().includes(s)) ||
      (row.responseMessage && row.responseMessage.toLowerCase().includes(s)) ||
      (row.threadName && row.threadName.toLowerCase().includes(s)) ||
      (row.url && row.url.toLowerCase().includes(s))
    );
  }, [filteredData, localSearch]);

  const totalPages = Math.ceil(displayData.length / pageSize);
  
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  } else if (currentPage < 1 && totalPages > 0) {
    setCurrentPage(1);
  }

  const currentData = displayData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const handleRowClick = (request) => {
    dispatch({ type: 'SET_SELECTED_REQUEST', payload: request });
  };

  const handleExport = () => {
    if (!displayData || displayData.length === 0) return;
    
    const baseFilename = fileName ? fileName.replace(/\.[^/.]+$/, "") : "jtl_export";
    const dateStr = new Date().toISOString().slice(0, 10);
    
    const exportData = displayData.map(row => ({
      timeStamp: row.timeStamp ? new Date(row.timeStamp).toISOString() : '',
      elapsed: row.elapsed,
      label: row.label,
      responseCode: row.responseCode,
      responseMessage: row.responseMessage,
      threadName: row.threadName,
      dataType: row.dataType,
      success: row.success ? 'true' : 'false',
      failureMessage: row.failureMessage || '',
      bytes: row.bytes || 0,
      sentBytes: row.sentBytes || 0,
      grpThreads: row.grpThreads || 0,
      allThreads: row.allThreads || 0,
      URL: row.url || '',
      Latency: row.latency || 0,
      IdleTime: row.idleTime || 0,
      Connect: row.connect || 0
    }));

    downloadCSV(exportData, `${baseFilename}_raw_${dateStr}.csv`);
  };

  if (!filteredData || filteredData.length === 0) return null;

  const columns = [
    { key: 'timeStamp', label: 'timeStamp', render: (val) => formatTimestamp(val) },
    { key: 'elapsed', label: 'elapsed', render: (val) => formatMs(val) },
    { key: 'label', label: 'label', render: (val) => <span className="truncate max-w-[150px] block" title={val}>{val}</span> },
    { key: 'responseCode', label: 'responseCode' },
    { key: 'responseMessage', label: 'responseMessage', render: (val) => <span className="truncate max-w-[150px] block" title={val}>{val}</span> },
    { key: 'threadName', label: 'threadName', render: (val) => <span className="truncate max-w-[150px] block" title={val}>{val}</span> },
    { key: 'dataType', label: 'dataType' },
    { key: 'success', label: 'success', render: (val) => val ? 'true' : 'false' },
    { key: 'bytes', label: 'bytes', render: (val) => formatBytes(val) },
    { key: 'sentBytes', label: 'sentBytes', render: (val) => formatBytes(val) },
    { key: 'grpThreads', label: 'grpThreads' },
    { key: 'allThreads', label: 'allThreads' },
    { key: 'url', label: 'URL', render: (val) => <span className="truncate max-w-[150px] block" title={val}>{val || '-'}</span> },
    { key: 'latency', label: 'Latency', render: (val) => formatMs(val) },
    { key: 'idleTime', label: 'IdleTime', render: (val) => formatMs(val) },
    { key: 'connect', label: 'Connect', render: (val) => formatMs(val) },
  ];

  return (
    <div className="space-y-4 animate-fade-in flex flex-col h-[calc(100vh-200px)]">
      {state.stats?.total > 100000 && (
        <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-300 px-4 py-2 rounded-lg text-sm flex items-center gap-2">
          <Database size={16} />
          <span><strong>Large Dataset Detected:</strong> Showing a random sample of 100,000 rows out of {state.stats.total.toLocaleString()} total requests to maintain browser performance.</span>
        </div>
      )}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 shrink-0">
        <h2 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
          <Database className="text-brand-500" />
          Raw Data Explorer
          <span className="text-sm font-normal text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-2 py-0.5 rounded-full ml-2">
            {displayData.length.toLocaleString()} records
          </span>
        </h2>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <div className="relative w-full sm:w-64">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={16} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search raw data..."
              value={localSearch}
              onChange={(e) => {
                setLocalSearch(e.target.value);
                setCurrentPage(1);
              }}
              className="block w-full pl-10 pr-3 py-1.5 border border-gray-300 dark:border-gray-700 rounded-lg text-sm bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 transition-colors"
            />
          </div>
          
          <button
            onClick={handleExport}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors shrink-0"
            title="Export raw data as CSV"
          >
            <Download size={16} className="text-gray-500 dark:text-gray-400" />
            <span className="hidden sm:inline">Export CSV</span>
          </button>
        </div>
      </div>
      
      <div className="glass rounded-xl overflow-hidden flex flex-col flex-1 min-h-0">
        <div className="overflow-x-auto overflow-y-auto flex-1 custom-scrollbar">
          <table className="w-full text-xs text-left whitespace-nowrap">
            <thead className="text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 uppercase border-b border-gray-200 dark:border-gray-800 sticky top-0 z-10">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className="px-3 py-2 font-medium">
                    {col.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
              {currentData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length} className="px-4 py-8 text-center text-gray-500 dark:text-gray-400">
                    No records match your search.
                  </td>
                </tr>
              ) : (
                currentData.map((row, idx) => (
                  <tr 
                    key={idx} 
                    onClick={() => handleRowClick(row)}
                    className={cn(
                      "cursor-pointer transition-colors font-mono",
                      row.success 
                        ? "hover:bg-gray-50 dark:hover:bg-gray-800/50" 
                        : "bg-red-50/30 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-900 dark:text-red-300"
                    )}
                  >
                    {columns.map((col) => (
                      <td key={col.key} className="px-3 py-1.5">
                        {col.render ? col.render(row[col.key], row) : (row[col.key] != null ? String(row[col.key]) : '-')}
                      </td>
                    ))}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between px-4 py-2 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30 shrink-0">
          <span className="text-xs text-gray-500 dark:text-gray-400">
            Showing {displayData.length > 0 ? ((currentPage - 1) * pageSize) + 1 : 0} to {Math.min(currentPage * pageSize, displayData.length)} of {displayData.length} records
          </span>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={16} />
            </button>
            
            <span className="text-xs font-medium px-2 text-gray-700 dark:text-gray-300">
              Page {currentPage} of {totalPages || 1}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={16} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages || totalPages === 0}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight size={16} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
