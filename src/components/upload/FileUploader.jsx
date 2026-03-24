import React, { useContext, useState, useRef } from 'react';
import { UploadCloud, FileText, AlertCircle, Loader2 } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import ParserWorker from '../../workers/jtlParser.worker.js?worker';
import { parseJTL } from '../../lib/parser';

export default function FileUploader() {
  const { state, dispatch } = useContext(AppContext);
  const { isParsing, parseProgress, parseError } = state;
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const workerRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;
    
    dispatch({ type: 'SET_PARSING', payload: true });
    
    try {
      if (window.Worker) {
        // Use Web Worker
        workerRef.current = new ParserWorker();
        
        workerRef.current.onmessage = (event) => {
          const { type, value, data, fileName, message } = event.data;
          
          if (type === 'progress') {
            dispatch({ type: 'SET_PARSE_PROGRESS', payload: value });
          } else if (type === 'complete') {
            dispatch({ type: 'SET_RAW_DATA', payload: { data, fileName, file } });
            workerRef.current.terminate();
          } else if (type === 'error') {
            dispatch({ type: 'SET_PARSE_ERROR', payload: message });
            workerRef.current.terminate();
          }
        };
        
        workerRef.current.postMessage({ file, fileName: file.name, filters: {} });
      } else {
        // Fallback to main thread (not recommended for large files)
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const text = e.target.result;
            const rows = await parseJTL(text, (progress) => {
              dispatch({ type: 'SET_PARSE_PROGRESS', payload: progress });
            });
            dispatch({ type: 'SET_RAW_DATA', payload: { data: rows, fileName: file.name, file } });
          } catch (err) {
            dispatch({ type: 'SET_PARSE_ERROR', payload: err.message });
          }
        };
        reader.onerror = () => {
          dispatch({ type: 'SET_PARSE_ERROR', payload: 'Failed to read file' });
        };
        reader.readAsText(file);
      }
    } catch (err) {
      dispatch({ type: 'SET_PARSE_ERROR', payload: err.message });
    }
  };

  const onDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const onDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFile(e.target.files[0]);
    }
  };

  if (isParsing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="glass rounded-2xl p-10 max-w-md w-full text-center shadow-xl animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-brand-50 dark:bg-brand-900/20 rounded-full flex items-center justify-center mb-6 relative">
            <Loader2 size={40} className="text-brand-500 animate-spin" />
            <div className="absolute inset-0 rounded-full border-4 border-brand-500/20"></div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Parsing JTL File...</h2>
          <p className="text-gray-500 dark:text-gray-400 mb-8">This might take a moment for large files.</p>
          
          <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 mb-2 overflow-hidden">
            <div 
              className="bg-brand-500 h-3 rounded-full transition-all duration-300 ease-out"
              style={{ width: `${parseProgress}%` }}
            ></div>
          </div>
          <div className="flex justify-between text-sm font-medium text-gray-600 dark:text-gray-300">
            <span>Processing</span>
            <span>{Math.round(parseProgress)}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 sm:p-8">
      <div className="max-w-2xl w-full text-center mb-8 animate-slide-up">
        <div className="inline-flex items-center justify-center p-3 bg-brand-100 dark:bg-brand-900/30 text-brand-600 dark:text-brand-400 rounded-2xl mb-6 shadow-sm">
          <UploadCloud size={32} />
        </div>
        <h1 className="text-4xl font-extrabold text-gray-900 dark:text-white tracking-tight mb-4">
          Analyze JMeter Results
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-300 max-w-xl mx-auto">
          Upload your JTL file to instantly generate interactive dashboards, performance metrics, and automated insights.
        </p>
      </div>

      <div 
        className={cn(
          "w-full max-w-2xl glass rounded-3xl p-10 border-2 border-dashed transition-all duration-300 ease-in-out cursor-pointer group animate-slide-up",
          isDragging 
            ? "border-brand-500 bg-brand-50/50 dark:bg-brand-900/10 scale-[1.02] shadow-xl" 
            : "border-gray-300 dark:border-gray-700 hover:border-brand-400 dark:hover:border-brand-500 hover:bg-gray-50/50 dark:hover:bg-gray-800/50 hover:shadow-lg"
        )}
        style={{ animationDelay: '100ms', animationFillMode: 'both' }}
        onDragOver={onDragOver}
        onDragLeave={onDragLeave}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <input 
          type="file" 
          ref={fileInputRef} 
          onChange={onFileChange} 
          className="hidden" 
          accept=".jtl,.csv,.xml,.txt"
        />
        
        <div className="flex flex-col items-center justify-center pointer-events-none">
          <div className={cn(
            "w-20 h-20 rounded-full flex items-center justify-center mb-6 transition-colors duration-300",
            isDragging ? "bg-brand-100 text-brand-600 dark:bg-brand-900/50 dark:text-brand-400" : "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400 group-hover:bg-brand-50 group-hover:text-brand-500 dark:group-hover:bg-brand-900/30 dark:group-hover:text-brand-400"
          )}>
            <FileText size={40} />
          </div>
          
          <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
            {isDragging ? 'Drop file here' : 'Click or drag file to upload'}
          </h3>
          
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Supports .jtl, .csv, and .xml formats
          </p>
          
          <div className="flex items-center gap-2 text-sm font-medium text-brand-600 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20 px-4 py-2 rounded-full">
            Browse Files
          </div>
        </div>
      </div>

      {parseError && (
        <div className="mt-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl flex items-start gap-3 max-w-2xl w-full animate-fade-in">
          <AlertCircle className="text-red-500 shrink-0 mt-0.5" size={20} />
          <div>
            <h4 className="text-sm font-semibold text-red-800 dark:text-red-300">Error parsing file</h4>
            <p className="text-sm text-red-600 dark:text-red-400 mt-1">{parseError}</p>
          </div>
        </div>
      )}
      
      <div className="mt-12 text-center text-sm text-gray-500 dark:text-gray-400 animate-fade-in" style={{ animationDelay: '200ms', animationFillMode: 'both' }}>
        <p className="flex items-center justify-center gap-2">
          <Shield size={16} />
          <span>100% Client-Side Processing. Your data never leaves your browser.</span>
        </p>
      </div>
    </div>
  );
}

function Shield(props) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
    </svg>
  );
}
