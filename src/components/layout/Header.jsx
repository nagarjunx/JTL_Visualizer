import React, { useContext, useState } from 'react';
import { BarChart3, Sun, Moon, FilePlus2, X } from 'lucide-react';
import { AppContext } from '../../context/AppContext';

export default function Header() {
  const { state, dispatch, toggleTheme } = useContext(AppContext);
  const { theme, fileName, rawFile } = state;
  const [showResetModal, setShowResetModal] = useState(false);

  const isDark = theme === 'dark';
  const hasData = !!rawFile;

  const handleReset = () => {
    setShowResetModal(true);
  };

  const confirmReset = () => {
    dispatch({ type: 'RESET' });
    setShowResetModal(false);
  };

  return (
    <>
      <header className="sticky top-0 z-50 w-full border-b border-gray-200 dark:border-gray-800 bg-white/80 dark:bg-gray-950/80 backdrop-blur-md transition-colors">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-brand-500 rounded-lg text-white shadow-sm">
              <BarChart3 size={24} />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-gray-900 dark:text-white hidden sm:block">
              JTL <span className="text-brand-500">Visualizer</span>
            </h1>
            
            {hasData && fileName && (
              <div className="hidden md:flex items-center ml-4 px-3 py-1 bg-gray-100 dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700">
                <span className="text-sm font-medium text-gray-600 dark:text-gray-300 truncate max-w-[200px]" title={fileName}>
                  {fileName}
                </span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-3">
            {hasData && (
              <button
                onClick={handleReset}
                className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 hover:bg-gray-100 dark:hover:bg-gray-800 rounded-lg transition-colors"
                title="Load new file"
              >
                <FilePlus2 size={18} />
                <span className="hidden sm:inline">New File</span>
              </button>
            )}
            
            <button
              onClick={toggleTheme}
              className="p-2 text-gray-500 hover:text-gray-900 dark:text-gray-400 dark:hover:text-white bg-gray-100 dark:bg-gray-800 rounded-lg transition-colors"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-gray-200 dark:border-gray-800 animate-slide-up">
            <div className="flex justify-between items-center p-4 border-b border-gray-100 dark:border-gray-800">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Load New File</h3>
              <button 
                onClick={() => setShowResetModal(false)}
                className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-gray-600 dark:text-gray-300">
                Are you sure you want to load a new file? All current data and analysis will be lost.
              </p>
            </div>
            <div className="flex justify-end gap-3 p-4 bg-gray-50 dark:bg-gray-800/50 border-t border-gray-100 dark:border-gray-800">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2 text-sm font-medium text-white bg-brand-600 hover:bg-brand-700 rounded-lg transition-colors shadow-sm"
              >
                Yes, load new file
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
