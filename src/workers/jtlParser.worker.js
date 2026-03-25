import { parseJTLStream, processRowsFromCache } from '../lib/parser';

let cachedRows = null;
let currentFileName = null;

self.onmessage = async (e) => {
  const { file, fileName, filters, type } = e.data;
  
  try {
    // If it's a new file, clear cache
    if (fileName !== currentFileName) {
      cachedRows = null;
      currentFileName = fileName;
    }

    if (type === 'filter' && cachedRows) {
      // Use cache if available
      self.postMessage({ type: 'progress', value: 10 });
      const results = processRowsFromCache(cachedRows, filters, (progress) => {
        self.postMessage({ type: 'progress', value: progress });
      });
      self.postMessage({ type: 'complete', data: results, fileName, requestType: type });
      return;
    }

    // Otherwise, perform full stream parse
    self.postMessage({ type: 'progress', value: 5 });
    
    // We only cache if the file is not excessively large to avoid OOM
    // 200MB is a reasonable limit for row caching in most modern browsers
    const shouldCache = file && file.size < 200 * 1024 * 1024;
    
    const resultsObject = await parseJTLStream(file, filters, (progress) => {
      self.postMessage({ type: 'progress', value: progress });
    }, shouldCache);
    
    const { cachedRows: newRows, ...aggResults } = resultsObject;
    
    if (newRows) {
      cachedRows = newRows;
    }
    
    self.postMessage({ type: 'complete', data: aggResults, fileName, requestType: type });
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message });
  }
};
