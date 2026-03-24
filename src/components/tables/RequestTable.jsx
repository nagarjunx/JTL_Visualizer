import React, { useContext, useState, useMemo } from 'react';
import { ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { formatTimestamp, formatMs, formatBytes, cn } from '../../lib/utils';

export default function RequestTable({ data }) {
  const { state, dispatch } = useContext(AppContext);
  const { filteredData } = state;
  
  const tableData = data || filteredData || [];
  
  const [sortConfig, setSortConfig] = useState({ key: 'timeStamp', direction: 'desc' });
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(50);

  const sortedData = useMemo(() => {
    let sortableItems = [...tableData];
    if (sortConfig.key) {
      sortableItems.sort((a, b) => {
        const aVal = a[sortConfig.key];
        const bVal = b[sortConfig.key];
        
        if (aVal == null && bVal == null) return 0;
        if (aVal == null) return sortConfig.direction === 'asc' ? -1 : 1;
        if (bVal == null) return sortConfig.direction === 'asc' ? 1 : -1;
        
        if (aVal < bVal) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aVal > bVal) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [tableData, sortConfig]);

  const totalPages = Math.ceil(sortedData.length / pageSize);
  
  // Ensure current page is valid when data changes
  if (currentPage > totalPages && totalPages > 0) {
    setCurrentPage(totalPages);
  } else if (currentPage < 1 && totalPages > 0) {
    setCurrentPage(1);
  }

  const currentData = sortedData.slice(
    (currentPage - 1) * pageSize,
    currentPage * pageSize
  );

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortIcon = (key) => {
    if (sortConfig.key !== key) return null;
    return sortConfig.direction === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />;
  };

  const handleRowClick = (request) => {
    dispatch({ type: 'SET_SELECTED_REQUEST', payload: request });
  };

  const columns = [
    { key: 'timeStamp', label: 'Time', render: (val) => formatTimestamp(val) },
    { key: 'label', label: 'Label', render: (val) => <span className="font-medium truncate max-w-[200px] block" title={val}>{val}</span> },
    { key: 'elapsed', label: 'Response', render: (val) => formatMs(val) },
    { 
      key: 'responseCode', 
      label: 'Code', 
      render: (val, row) => (
        <span className={cn(
          "px-2 py-0.5 rounded-md text-xs font-medium",
          row.success ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-400"
        )}>
          {val || '-'}
        </span>
      ) 
    },
    { 
      key: 'success', 
      label: 'Status', 
      render: (val) => val ? <span className="text-emerald-500">Pass</span> : <span className="text-red-500 font-medium">Fail</span> 
    },
    { key: 'latency', label: 'Latency', render: (val) => formatMs(val) },
    { key: 'bytes', label: 'Bytes', render: (val) => formatBytes(val) },
    { key: 'threadName', label: 'Thread', render: (val) => <span className="truncate max-w-[150px] block text-xs" title={val}>{val}</span> },
  ];

  if (tableData.length === 0) {
    return (
      <div className="glass rounded-xl p-8 flex flex-col items-center justify-center text-center border-dashed">
        <p className="text-gray-500 dark:text-gray-400">No requests match the current filters.</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl overflow-hidden flex flex-col animate-fade-in">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/50 uppercase border-b border-gray-200 dark:border-gray-800">
            <tr>
              {columns.map((col) => (
                <th 
                  key={col.key} 
                  className="px-4 py-3 font-medium cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors select-none group"
                  onClick={() => requestSort(col.key)}
                >
                  <div className="flex items-center gap-1">
                    {col.label}
                    <span className="text-gray-400 opacity-0 group-hover:opacity-100 transition-opacity">
                      {getSortIcon(col.key) || <ChevronUp size={14} className="opacity-30" />}
                    </span>
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200 dark:divide-gray-800">
            {currentData.map((row, idx) => (
              <tr 
                key={idx} 
                onClick={() => handleRowClick(row)}
                className={cn(
                  "cursor-pointer transition-colors",
                  row.success 
                    ? "hover:bg-gray-50 dark:hover:bg-gray-800/50" 
                    : "bg-red-50/50 dark:bg-red-900/10 hover:bg-red-50 dark:hover:bg-red-900/20"
                )}
              >
                {columns.map((col) => (
                  <td key={col.key} className="px-4 py-2.5 text-gray-900 dark:text-gray-100">
                    {col.render ? col.render(row[col.key], row) : row[col.key]}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="flex flex-col sm:flex-row items-center justify-between px-4 py-3 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/30">
        <div className="flex items-center gap-2 mb-3 sm:mb-0">
          <span className="text-sm text-gray-500 dark:text-gray-400">Rows per page:</span>
          <select
            value={pageSize}
            onChange={(e) => {
              setPageSize(Number(e.target.value));
              setCurrentPage(1);
            }}
            className="bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-900 dark:text-gray-100 text-sm rounded-md focus:ring-brand-500 focus:border-brand-500 p-1"
          >
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
            <option value={200}>200</option>
          </select>
        </div>

        <div className="flex items-center gap-4">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, sortedData.length)} of {sortedData.length}
          </span>
          
          <div className="flex items-center gap-1">
            <button
              onClick={() => setCurrentPage(1)}
              disabled={currentPage === 1}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsLeft size={18} />
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronLeft size={18} />
            </button>
            
            <span className="text-sm font-medium px-2 text-gray-700 dark:text-gray-300">
              {currentPage} / {totalPages}
            </span>
            
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronRight size={18} />
            </button>
            <button
              onClick={() => setCurrentPage(totalPages)}
              disabled={currentPage === totalPages}
              className="p-1 rounded-md text-gray-500 hover:bg-gray-200 dark:hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <ChevronsRight size={18} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
