import React, { createContext, useReducer, useEffect, useRef } from 'react';
import { generateInsights } from '../lib/insights';
import ParserWorker from '../workers/jtlParser.worker.js?worker';

const initialState = {
  theme: localStorage.getItem('jtl-theme') || 'dark',
  rawFile: null, // Store the File object instead of raw data
  rawTotalCount: 0,
  fileName: '',
  parseProgress: 0,
  isParsing: false,
  parseError: null,
  activeTab: 'overview',
  filters: {
    timeRange: null,
    labels: [],
    responseCodes: [],
    success: null,
    threadGroups: [],
    search: '',
  },
  stats: null,
  perLabelStats: [],
  timeSeries: [],
  errorBreakdown: { topCodes: [], topMessages: [] },
  distribution: [],
  insights: [],
  availableLabels: [],
  availableResponseCodes: [],
  availableThreadGroups: [],
  selectedRequest: null,
  compareEndpoints: [],
  detailDrawerOpen: false,
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_THEME':
      localStorage.setItem('jtl-theme', action.payload);
      return { ...state, theme: action.payload };
    case 'SET_PARSING':
      return { ...state, isParsing: action.payload, parseError: null };
    case 'SET_PARSE_PROGRESS':
      return { ...state, parseProgress: action.payload };
    case 'SET_PARSE_ERROR':
      return { ...state, parseError: action.payload, isParsing: false };
    case 'SET_RAW_DATA':
      return { 
        ...state, 
        rawFile: action.payload.file, 
        fileName: action.payload.fileName,
        rawTotalCount: action.payload.data.stats.total,
        isParsing: false,
        parseProgress: 100,
        filters: initialState.filters, // Reset filters on new file
        activeTab: 'overview',
        compareEndpoints: [],
        selectedRequest: null,
        detailDrawerOpen: false,
        // Set aggregated data directly
        ...action.payload.data,
        insights: generateInsights(
          action.payload.data.stats, 
          action.payload.data.perLabelStats, 
          action.payload.data.timeSeries, 
          action.payload.data.errorBreakdown
        )
      };
    case 'SET_FILTERED_DATA':
      return {
        ...state,
        isParsing: false,
        ...action.payload.data,
        insights: generateInsights(
          action.payload.data.stats, 
          action.payload.data.perLabelStats, 
          action.payload.data.timeSeries, 
          action.payload.data.errorBreakdown
        )
      };
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'SET_ACTIVE_TAB':
      return { ...state, activeTab: action.payload };
    case 'SET_SELECTED_REQUEST':
      return { ...state, selectedRequest: action.payload, detailDrawerOpen: !!action.payload };
    case 'SET_DETAIL_DRAWER':
      return { ...state, detailDrawerOpen: action.payload };
    case 'SET_COMPARE_ENDPOINTS':
      return { ...state, compareEndpoints: action.payload };
    case 'TOGGLE_COMPARE_ENDPOINT':
      const current = state.compareEndpoints;
      const label = action.payload;
      if (current.includes(label)) {
        return { ...state, compareEndpoints: current.filter(l => l !== label) };
      } else if (current.length < 4) {
        return { ...state, compareEndpoints: [...current, label] };
      }
      return state;
    case 'RESET':
      return { ...initialState, theme: state.theme };
    default:
      return state;
  }
}

export const AppContext = createContext();

export function AppProvider({ children }) {
  const [state, dispatch] = useReducer(reducer, initialState);
  const workerRef = useRef(null);
  const isFirstRender = useRef(true);

  // Theme effect
  useEffect(() => {
    if (state.theme === 'dark') {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [state.theme]);

  // Re-parse on filter change
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    if (!state.rawFile) return;

    // Terminate existing worker if running
    if (workerRef.current) {
      workerRef.current.terminate();
    }

    dispatch({ type: 'SET_PARSING', payload: true });

    workerRef.current = new ParserWorker();
    
    workerRef.current.onmessage = (event) => {
      const { type, value, data, message } = event.data;
      
      if (type === 'progress') {
        dispatch({ type: 'SET_PARSE_PROGRESS', payload: value });
      } else if (type === 'complete') {
        dispatch({ type: 'SET_FILTERED_DATA', payload: { data } });
        workerRef.current.terminate();
        workerRef.current = null;
      } else if (type === 'error') {
        dispatch({ type: 'SET_PARSE_ERROR', payload: message });
        if (workerRef.current) {
          workerRef.current.terminate();
          workerRef.current = null;
        }
      }
    };
    
    workerRef.current.postMessage({ 
      file: state.rawFile, 
      fileName: state.fileName, 
      filters: state.filters 
    });

    return () => {
      if (workerRef.current) {
        workerRef.current.terminate();
      }
    };
  }, [state.filters]); // Only re-run when filters change

  const toggleTheme = () => {
    dispatch({ type: 'SET_THEME', payload: state.theme === 'dark' ? 'light' : 'dark' });
  };

  const setFilters = (partialFilters) => {
    dispatch({ type: 'SET_FILTERS', payload: partialFilters });
  };

  const resetFilters = () => {
    dispatch({ type: 'SET_FILTERS', payload: initialState.filters });
  };

  return (
    <AppContext.Provider value={{ state, dispatch, toggleTheme, setFilters, resetFilters }}>
      {children}
    </AppContext.Provider>
  );
}
