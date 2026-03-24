import React, { useContext, useEffect } from 'react';
import { X, CheckCircle2, XCircle, Clock, Activity, FileText, Database, Server, Link as LinkIcon } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { formatTimestamp, formatMs, formatBytes, cn } from '../../lib/utils';

export default function DetailDrawer() {
  const { state, dispatch } = useContext(AppContext);
  const { selectedRequest, detailDrawerOpen } = state;

  // Close on escape key
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && detailDrawerOpen) {
        closeDrawer();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [detailDrawerOpen]);

  const closeDrawer = () => {
    dispatch({ type: 'SET_DETAIL_DRAWER', payload: false });
    // Optional: delay clearing selected request to allow animation to finish
    setTimeout(() => dispatch({ type: 'SET_SELECTED_REQUEST', payload: null }), 300);
  };

  if (!selectedRequest && !detailDrawerOpen) return null;

  const req = selectedRequest || {};
  const isSuccess = req.success;

  const details = [
    { label: 'Timestamp', value: req.timeStamp ? new Date(req.timeStamp).toLocaleString() : '-', icon: Clock },
    { label: 'Label', value: req.label, icon: FileText },
    { label: 'Response Time', value: formatMs(req.elapsed), icon: Activity },
    { label: 'Latency', value: formatMs(req.latency), icon: Activity },
    { label: 'Connect Time', value: formatMs(req.connect), icon: Activity },
    { label: 'Response Code', value: req.responseCode || '-', icon: Server },
    { label: 'Response Message', value: req.responseMessage || '-', icon: FileText },
    { label: 'Success', value: isSuccess ? 'True' : 'False', icon: isSuccess ? CheckCircle2 : XCircle, color: isSuccess ? 'text-emerald-500' : 'text-red-500' },
    { label: 'Thread Name', value: req.threadName || '-', icon: Database },
    { label: 'Bytes Received', value: formatBytes(req.bytes), icon: Database },
    { label: 'Bytes Sent', value: formatBytes(req.sentBytes), icon: Database },
    { label: 'URL', value: req.url || '-', icon: LinkIcon },
    { label: 'Data Type', value: req.dataType || '-', icon: FileText },
    { label: 'Sample Count', value: req.sampleCount || 1, icon: Activity },
    { label: 'Error Count', value: req.errorCount || 0, icon: AlertTriangle },
    { label: 'Idle Time', value: formatMs(req.idleTime), icon: Clock },
    { label: 'Active Threads', value: req.allThreads || '-', icon: Database },
    { label: 'Group Threads', value: req.grpThreads || '-', icon: Database },
  ];

  // Helper icon for Error Count
  function AlertTriangle(props) {
    return (
      <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </svg>
    );
  }

  return (
    <>
      {/* Backdrop */}
      <div 
        className={cn(
          "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300",
          detailDrawerOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={closeDrawer}
      />

      {/* Drawer */}
      <div 
        className={cn(
          "fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white dark:bg-gray-900 shadow-2xl border-l border-gray-200 dark:border-gray-800 transform transition-transform duration-300 ease-in-out flex flex-col",
          detailDrawerOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-gray-800 bg-gray-50/50 dark:bg-gray-900/50">
          <div className="flex items-center gap-3">
            <div className={cn(
              "p-2 rounded-full",
              isSuccess ? "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400" : "bg-red-100 text-red-600 dark:bg-red-900/30 dark:text-red-400"
            )}>
              {isSuccess ? <CheckCircle2 size={24} /> : <XCircle size={24} />}
            </div>
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">Request Details</h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-[250px]" title={req.label}>
                {req.label}
              </p>
            </div>
          </div>
          <button 
            onClick={closeDrawer}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-full transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-6">
            
            {/* Status Banner */}
            <div className={cn(
              "p-4 rounded-xl border",
              isSuccess 
                ? "bg-emerald-50 border-emerald-200 dark:bg-emerald-900/10 dark:border-emerald-900/30" 
                : "bg-red-50 border-red-200 dark:bg-red-900/10 dark:border-red-900/30"
            )}>
              <div className="flex justify-between items-center">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Status Code</span>
                <span className={cn(
                  "text-2xl font-bold",
                  isSuccess ? "text-emerald-700 dark:text-emerald-400" : "text-red-700 dark:text-red-400"
                )}>
                  {req.responseCode || 'Unknown'}
                </span>
              </div>
              {!isSuccess && req.responseMessage && (
                <div className="mt-2 pt-2 border-t border-red-200 dark:border-red-900/30">
                  <span className="text-sm text-red-800 dark:text-red-300 font-medium block mb-1">Error Message:</span>
                  <p className="text-sm text-red-600 dark:text-red-400 break-words">{req.responseMessage}</p>
                </div>
              )}
            </div>

            {/* Details Grid */}
            <div className="grid grid-cols-1 gap-4">
              {details.map((detail, idx) => {
                const Icon = detail.icon;
                // Skip empty values to keep it clean
                if (detail.value === '-' || detail.value === '' || detail.value == null) return null;
                
                return (
                  <div key={idx} className="flex items-start gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors">
                    <div className="mt-0.5 text-gray-400 dark:text-gray-500">
                      <Icon size={18} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider mb-1">
                        {detail.label}
                      </p>
                      <p className={cn(
                        "text-sm font-medium break-words",
                        detail.color ? detail.color : "text-gray-900 dark:text-gray-100"
                      )}>
                        {detail.value}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
        
        {/* Footer */}
        <div className="p-4 border-t border-gray-200 dark:border-gray-800 bg-gray-50 dark:bg-gray-900/50 flex justify-end">
          <button 
            onClick={closeDrawer}
            className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 font-medium text-sm transition-colors"
          >
            Close
          </button>
        </div>
      </div>
    </>
  );
}
