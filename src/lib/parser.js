import Papa from 'papaparse';
import { SaxesParser } from 'saxes';
import { StreamingAggregator } from './streamingAggregator';

const ALIASES = {
  timeStamp: ['timestamp', 'ts', 'time', 'timestampms'],
  elapsed: ['elapsed', 'elapsedtime', 'responsetime', 't'],
  label: ['label', 'sampler_label', 'name', 'samplerlabel', 'lb'],
  responseCode: ['responsecode', 'rc', 'response_code', 'statuscode', 'status_code'],
  responseMessage: ['responsemessage', 'rm', 'response_message', 'statusmessage'],
  threadName: ['threadname', 'thread_name', 'tn', 'thread'],
  success: ['success', 'issuccess', 's'],
  bytes: ['bytes', 'receivedbytes', 'bytesreceived', 'by'],
  sentBytes: ['sentbytes', 'bytes_sent', 'sb'],
  grpThreads: ['grpthreads', 'group_threads', 'grp_threads', 'ng'],
  allThreads: ['allthreads', 'all_threads', 'activethreads', 'na'],
  latency: ['latency', 'lt'],
  idleTime: ['idletime', 'idle_time', 'it'],
  connect: ['connect', 'connecttime', 'connect_time', 'ct'],
  url: ['url'],
  dataType: ['datatype', 'data_type', 'dt'],
  sampleCount: ['samplecount', 'sample_count', 'sc'],
  errorCount: ['errorcount', 'error_count', 'ec']
};

function normalizeColumnName(col) {
  if (!col) return col;
  const lower = col.toLowerCase().trim();
  for (const [canonical, aliases] of Object.entries(ALIASES)) {
    if (canonical.toLowerCase() === lower || aliases.includes(lower)) {
      return canonical;
    }
  }
  return col;
}

function parseBoolean(val) {
  if (typeof val === 'boolean') return val;
  if (!val) return false;
  const lower = String(val).toLowerCase().trim();
  return lower === 'true' || lower === '1' || lower === 'yes';
}

function parseNumeric(val) {
  if (val === null || val === undefined || val === '') return null;
  const num = Number(val);
  return isNaN(num) ? null : num;
}

function normalizeRow(raw) {
  return {
    timeStamp: parseNumeric(raw.timeStamp),
    elapsed: parseNumeric(raw.elapsed) || 0,
    label: raw.label || 'Unknown',
    responseCode: String(raw.responseCode || ''),
    responseMessage: String(raw.responseMessage || ''),
    threadName: String(raw.threadName || ''),
    success: parseBoolean(raw.success),
    bytes: parseNumeric(raw.bytes),
    sentBytes: parseNumeric(raw.sentBytes),
    latency: parseNumeric(raw.latency),
    connect: parseNumeric(raw.connect),
    grpThreads: parseNumeric(raw.grpThreads),
    allThreads: parseNumeric(raw.allThreads),
    idleTime: parseNumeric(raw.idleTime),
    sampleCount: parseNumeric(raw.sampleCount) || 1,
    errorCount: parseNumeric(raw.errorCount) || 0,
    url: raw.url,
    dataType: raw.dataType,
  };
}

function detectFormat(text) {
  const sample = text.substring(0, 500).trim();
  if (sample.startsWith('<?xml') || sample.startsWith('<testResults') || sample.startsWith('<httpSample')) {
    return 'xml';
  }
  return 'csv';
}

function parseXML(text) {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(text, 'text/xml');
  const samples = xmlDoc.querySelectorAll('httpSample, sample');
  
  const rows = [];
  samples.forEach(sample => {
    const raw = {};
    for (let i = 0; i < sample.attributes.length; i++) {
      const attr = sample.attributes[i];
      const canonical = normalizeColumnName(attr.name);
      raw[canonical] = attr.value;
    }
    rows.push(normalizeRow(raw));
  });
  return rows;
}

export function parseJTL(text, onProgress) {
  return new Promise((resolve, reject) => {
    try {
      const format = detectFormat(text);
      if (format === 'xml') {
        const rows = parseXML(text);
        if (onProgress) onProgress(100);
        resolve(rows);
        return;
      }

      // CSV format
      const rows = [];
      let rowCount = 0;
      
      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => normalizeColumnName(header),
        step: (results) => {
          if (results.data) {
            rows.push(normalizeRow(results.data));
            rowCount++;
          }
        },
        complete: () => {
          if (onProgress) onProgress(100);
          resolve(rows);
        },
        error: (err) => {
          reject(err);
        }
      });
    } catch (err) {
      reject(err);
    }
  });
}

function parseXMLStream(file, aggregator, onProgress) {
  return new Promise((resolve, reject) => {
    const parser = new SaxesParser();
    let rowCount = 0;
    const totalBytes = file.size;
    let bytesRead = 0;
    
    parser.on('opentag', (node) => {
      if (node.name === 'httpSample' || node.name === 'sample') {
        const raw = {};
        for (const [key, value] of Object.entries(node.attributes)) {
          const canonical = normalizeColumnName(key);
          raw[canonical] = value;
        }
        const row = normalizeRow(raw);
        aggregator.processRow(row);
        rowCount++;
        
        if (rowCount % 10000 === 0 && onProgress) {
          onProgress(Math.min(99, (bytesRead / totalBytes) * 100));
        }
      }
    });

    parser.on('error', (err) => {
      reject(err);
    });

    parser.on('end', () => {
      if (onProgress) onProgress(100);
      resolve(aggregator.getResults());
    });

    const reader = new FileReader();
    const chunkSize = 1024 * 1024; // 1MB chunks
    let offset = 0;

    reader.onload = (e) => {
      const chunk = e.target.result;
      parser.write(chunk);
      bytesRead += chunk.length;
      offset += chunkSize;
      
      if (offset < totalBytes) {
        readNextChunk();
      } else {
        parser.close();
      }
    };

    reader.onerror = () => {
      reject(new Error("Error reading file chunk"));
    };

    function readNextChunk() {
      const slice = file.slice(offset, offset + chunkSize);
      reader.readAsText(slice);
    }

    readNextChunk();
  });
}

export function parseJTLStream(file, filters, onProgress) {
  return new Promise((resolve, reject) => {
    try {
      const aggregator = new StreamingAggregator(filters);
      
      // Read a small chunk to detect format
      const detectReader = new FileReader();
      detectReader.onload = (e) => {
        const format = detectFormat(e.target.result);
        
        if (format === 'xml') {
          parseXMLStream(file, aggregator, onProgress)
            .then(resolve)
            .catch(reject);
        } else {
          // CSV format
          let rowCount = 0;
          const totalBytes = file.size;
          
          Papa.parse(file, {
            header: true,
            skipEmptyLines: true,
            worker: false, // We are already in a worker
            transformHeader: (header) => normalizeColumnName(header),
            step: (results, parser) => {
              if (results.data) {
                const row = normalizeRow(results.data);
                aggregator.processRow(row);
                rowCount++;
                
                if (rowCount % 10000 === 0 && onProgress) {
                  onProgress(Math.min(99, (rowCount / (totalBytes / 100)) * 100));
                }
              }
            },
            complete: () => {
              if (onProgress) onProgress(100);
              resolve(aggregator.getResults());
            },
            error: (err) => {
              reject(err);
            }
          });
        }
      };
      detectReader.onerror = () => reject(new Error("Failed to read file for format detection"));
      detectReader.readAsText(file.slice(0, 1024));
      
    } catch (err) {
      reject(err);
    }
  });
}
