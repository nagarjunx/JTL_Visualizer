import React, { useContext, useState } from 'react';
import { Sun, Moon, X, UploadCloud } from 'lucide-react';
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

  const triggerUpload = () => {
    if (hasData) {
      handleReset();
    } else {
      // In Dashboard without data, the file input is inside FileUploader
      // We can trigger it by finding the input, or we can just scroll to hero section
      const fileInput = document.querySelector('input[type="file"]');
      if (fileInput) fileInput.click();
    }
  };

  return (
    <>
      <header className="sticky top-0 w-full z-50 bg-surface/60 backdrop-blur-xl border-b border-outline-variant/30 shadow-2xl shadow-primary/5">
        <div className="flex justify-between items-center max-w-[1200px] mx-auto px-6 h-16">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-blue-500 text-2xl" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>bar_chart_4_bars</span>
            <span className="text-on-surface font-bold text-xl tracking-tight">JTL Visualizer</span>
            
            {hasData && fileName && (
              <div className="hidden md:flex items-center ml-4 px-3 py-1 bg-surface-container-low rounded-full border border-outline-variant/20">
                <span className="text-sm font-medium text-on-surface-variant truncate max-w-[200px]" title={fileName}>
                  {fileName}
                </span>
              </div>
            )}
          </div>
          
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium font-inter">
            <a href="#features" className="text-on-surface hover:text-primary transition-colors border border-outline-variant/20 px-3 py-1 rounded-md bg-surface-container-low">Features</a>
            <a href="#security" className="text-on-surface-variant hover:text-on-surface transition-colors">Security</a>
            <a href="#documentation" className="text-on-surface-variant hover:text-on-surface transition-colors">Documentation</a>
            <a href="https://github.com/nagarjunx/JTL_Visualizer" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-on-surface transition-colors">GitHub</a>
          </nav>
          
          <div className="flex items-center gap-6">
            <button
              onClick={toggleTheme}
              className="p-2 text-on-surface-variant hover:text-on-surface transition-colors"
              title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            >
              {isDark ? <Sun size={20} /> : <Moon size={20} />}
            </button>
            <button 
              onClick={triggerUpload}
              className="bg-blue-500 hover:bg-blue-400 text-white text-sm font-bold py-2 px-5 rounded-lg transition-all shadow-lg shadow-blue-500/20 active:scale-95 flex items-center gap-2"
            >
              {hasData ? (
                <>
                  <UploadCloud size={16} />
                  <span>New File</span>
                </>
              ) : (
                <span>Get Started</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Reset Confirmation Modal */}
      {showResetModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm animate-fade-in">
          <div className="bg-surface-container dark:bg-gray-900 rounded-xl shadow-2xl max-w-md w-full mx-4 overflow-hidden border border-outline-variant/30 animate-slide-up">
            <div className="flex justify-between items-center p-4 border-b border-outline-variant/20">
              <h3 className="text-lg font-semibold text-on-surface">Load New File</h3>
              <button 
                onClick={() => setShowResetModal(false)}
                className="text-on-surface-variant hover:text-on-surface transition-colors"
              >
                <X size={20} />
              </button>
            </div>
            <div className="p-6">
              <p className="text-on-surface-variant">
                Are you sure you want to load a new file? All current data and analysis will be lost.
              </p>
            </div>
            <div className="flex justify-end gap-3 p-4 bg-surface-container-low border-t border-outline-variant/20">
              <button
                onClick={() => setShowResetModal(false)}
                className="px-4 py-2 text-sm font-medium text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={confirmReset}
                className="px-4 py-2 text-sm font-medium text-on-primary bg-gradient-to-br from-primary-fixed-dim to-primary-container rounded-lg transition-colors shadow-sm"
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
