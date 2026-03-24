import React, { useContext, useState, useRef, useEffect } from 'react';
import { Search, Filter, X, CheckCircle2, XCircle, RefreshCw, ChevronDown } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { cn } from '../../lib/utils';

// MultiSelect component
function MultiSelect({ label, options, selected, onChange, placeholder }) {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const toggleOption = (option) => {
    const newSelected = selected.includes(option)
      ? selected.filter(item => item !== option)
      : [...selected, option];
    onChange(newSelected);
  };

  const clearAll = (e) => {
    e.stopPropagation();
    onChange([]);
    setIsOpen(false);
  };

  const hasSelection = selected.length > 0;

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "flex items-center justify-between w-full px-3 py-2 text-sm bg-white dark:bg-gray-800 border rounded-lg transition-colors",
          hasSelection 
            ? "border-brand-500 text-brand-700 dark:text-brand-400 bg-brand-50 dark:bg-brand-900/20" 
            : "border-gray-300 dark:border-gray-700 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
        )}
      >
        <div className="flex items-center gap-2 truncate">
          <span className="font-medium truncate">{label}</span>
          {hasSelection && (
            <span className="flex items-center justify-center w-5 h-5 text-xs font-bold text-white bg-brand-500 rounded-full">
              {selected.length}
            </span>
          )}
        </div>
        <ChevronDown size={16} className={cn("ml-2 transition-transform", isOpen && "rotate-180")} />
      </button>

      {isOpen && (
        <div className="absolute z-50 w-64 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg max-h-60 overflow-y-auto">
          <div className="sticky top-0 flex items-center justify-between px-3 py-2 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <span className="text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
              {placeholder || 'Select options'}
            </span>
            {hasSelection && (
              <button
                onClick={clearAll}
                className="text-xs text-brand-600 dark:text-brand-400 hover:underline"
              >
                Clear all
              </button>
            )}
          </div>
          <div className="p-1">
            {options.length === 0 ? (
              <div className="px-3 py-2 text-sm text-gray-500 dark:text-gray-400">No options available</div>
            ) : (
              options.map((option, idx) => {
                const isSelected = selected.includes(option);
                return (
                  <label
                    key={idx}
                    className="flex items-center px-3 py-2 text-sm rounded-md cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                  >
                    <div className="relative flex items-center justify-center w-4 h-4 mr-3 border rounded border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800">
                      <input
                        type="checkbox"
                        className="absolute opacity-0 w-full h-full cursor-pointer"
                        checked={isSelected}
                        onChange={() => toggleOption(option)}
                      />
                      {isSelected && <CheckCircle2 size={12} className="text-brand-500" />}
                    </div>
                    <span className="truncate text-gray-700 dark:text-gray-300" title={option}>{option}</span>
                  </label>
                );
              })
            )}
          </div>
        </div>
      )}
    </div>
  );
}

export default function FilterBar() {
  const { state, setFilters, resetFilters } = useContext(AppContext);
  const { 
    filters, 
    availableLabels, 
    availableResponseCodes, 
    availableThreadGroups,
    filteredData
  } = state;

  const handleSearchChange = (e) => {
    setFilters({ search: e.target.value });
  };

  const handleSuccessToggle = (val) => {
    setFilters({ success: filters.success === val ? null : val });
  };

  const hasActiveFilters = 
    filters.search !== '' || 
    filters.labels.length > 0 || 
    filters.responseCodes.length > 0 || 
    filters.threadGroups.length > 0 || 
    filters.success !== null;

  const totalCount = state.rawTotalCount || 0;
  const filteredCount = state.stats?.total || 0; // In streaming mode, stats.total is the filtered count
  const isFiltered = hasActiveFilters;

  return (
    <div className="sticky top-[120px] z-30 mb-6 bg-gray-50/95 dark:bg-gray-950/95 backdrop-blur-md py-3 border-b border-gray-200 dark:border-gray-800">
      <div className="flex flex-col lg:flex-row gap-4 items-start lg:items-center justify-between">
        
        {/* Search Input */}
        <div className="relative w-full lg:w-64 shrink-0">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search size={16} className="text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Search requests..."
            value={filters.search}
            onChange={handleSearchChange}
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-700 rounded-lg leading-5 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-brand-500 sm:text-sm transition-colors"
          />
          {filters.search && (
            <button
              onClick={() => setFilters({ search: '' })}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
            >
              <X size={14} />
            </button>
          )}
        </div>

        {/* Filters Group */}
        <div className="flex flex-wrap items-center gap-3 flex-1 w-full">
          <div className="w-full sm:w-auto min-w-[160px]">
            <MultiSelect
              label="Endpoints"
              options={availableLabels}
              selected={filters.labels}
              onChange={(labels) => setFilters({ labels })}
              placeholder="Filter by endpoint"
            />
          </div>
          
          <div className="w-full sm:w-auto min-w-[160px]">
            <MultiSelect
              label="Status Codes"
              options={availableResponseCodes}
              selected={filters.responseCodes}
              onChange={(responseCodes) => setFilters({ responseCodes })}
              placeholder="Filter by status code"
            />
          </div>

          {availableThreadGroups.length > 0 && (
            <div className="w-full sm:w-auto min-w-[160px]">
              <MultiSelect
                label="Thread Groups"
                options={availableThreadGroups}
                selected={filters.threadGroups}
                onChange={(threadGroups) => setFilters({ threadGroups })}
                placeholder="Filter by thread group"
              />
            </div>
          )}

          {/* Success Toggle */}
          <div className="flex items-center bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded-lg p-1">
            <button
              onClick={() => handleSuccessToggle(null)}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-md transition-colors",
                filters.success === null 
                  ? "bg-gray-100 dark:bg-gray-700 text-gray-900 dark:text-gray-100 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              All
            </button>
            <button
              onClick={() => handleSuccessToggle(true)}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center gap-1",
                filters.success === true 
                  ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              <CheckCircle2 size={14} />
              <span className="hidden sm:inline">Passed</span>
            </button>
            <button
              onClick={() => handleSuccessToggle(false)}
              className={cn(
                "px-3 py-1 text-sm font-medium rounded-md transition-colors flex items-center gap-1",
                filters.success === false 
                  ? "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 shadow-sm" 
                  : "text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              )}
            >
              <XCircle size={14} />
              <span className="hidden sm:inline">Failed</span>
            </button>
          </div>

          {/* Reset Button */}
          {hasActiveFilters && (
            <button
              onClick={resetFilters}
              className="flex items-center gap-1 px-3 py-2 text-sm font-medium text-gray-600 dark:text-gray-300 hover:text-brand-600 dark:hover:text-brand-400 transition-colors"
              title="Reset all filters"
            >
              <RefreshCw size={14} />
              <span className="hidden sm:inline">Reset</span>
            </button>
          )}
        </div>

        {/* Filter Count Indicator */}
        {isFiltered && (
          <div className="shrink-0 flex items-center gap-2 text-sm text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-800 px-3 py-1.5 rounded-full">
            <Filter size={14} className="text-brand-500" />
            <span>Showing <strong className="text-gray-900 dark:text-gray-100">{filteredCount.toLocaleString()}</strong> of {totalCount.toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
}
