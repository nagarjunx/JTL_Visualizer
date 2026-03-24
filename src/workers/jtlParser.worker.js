import { parseJTLStream } from '../lib/parser';

self.onmessage = async (e) => {
  const { file, fileName, filters } = e.data;
  try {
    self.postMessage({ type: 'progress', value: 5 });
    
    // Pass the file directly to the streaming parser
    const aggregatedData = await parseJTLStream(file, filters, (progress) => {
      self.postMessage({ type: 'progress', value: progress });
    });
    
    self.postMessage({ type: 'complete', data: aggregatedData, fileName });
  } catch (err) {
    self.postMessage({ type: 'error', message: err.message });
  }
};
