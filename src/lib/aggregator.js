import { mean, median, percentile, stdDev, coefficientOfVariation } from './utils';

export function computeOverallStats(data) {
  if (!data || data.length === 0) return null;

  const total = data.length;
  let successCount = 0;
  let failCount = 0;
  let totalBytes = 0;
  let totalSentBytes = 0;
  let totalLatency = 0;
  let totalConnect = 0;
  let minTime = Infinity;
  let maxTime = -Infinity;
  const elapsedArr = [];

  for (const row of data) {
    if (row.success) successCount++;
    else failCount++;

    if (row.bytes) totalBytes += row.bytes;
    if (row.sentBytes) totalSentBytes += row.sentBytes;
    if (row.latency) totalLatency += row.latency;
    if (row.connect) totalConnect += row.connect;

    if (row.timeStamp) {
      if (row.timeStamp < minTime) minTime = row.timeStamp;
      if (row.timeStamp > maxTime) maxTime = row.timeStamp;
    }

    elapsedArr.push(row.elapsed);
  }

  elapsedArr.sort((a, b) => a - b);

  const durationSec = minTime !== Infinity && maxTime !== -Infinity ? (maxTime - minTime) / 1000 : 0;
  const throughput = durationSec > 0 ? total / durationSec : 0;

  return {
    total,
    successCount,
    failCount,
    successRate: (successCount / total) * 100,
    failRate: (failCount / total) * 100,
    avgResponseTime: mean(elapsedArr),
    medianResponseTime: median(elapsedArr),
    p90: percentile(elapsedArr, 90),
    p95: percentile(elapsedArr, 95),
    p99: percentile(elapsedArr, 99),
    minResponseTime: elapsedArr[0] || 0,
    maxResponseTime: elapsedArr[elapsedArr.length - 1] || 0,
    throughput,
    totalBytes,
    totalSentBytes,
    avgBytes: totalBytes / total,
    avgLatency: totalLatency / total,
    avgConnect: totalConnect / total,
    minTime,
    maxTime,
    durationSec,
    stdDev: stdDev(elapsedArr)
  };
}

export function computePerLabelStats(data) {
  const map = new Map();

  for (const row of data) {
    if (!map.has(row.label)) {
      map.set(row.label, {
        label: row.label,
        total: 0,
        successCount: 0,
        failCount: 0,
        elapsedArr: [],
        totalBytes: 0,
        minTime: Infinity,
        maxTime: -Infinity
      });
    }
    const stat = map.get(row.label);
    stat.total++;
    if (row.success) stat.successCount++;
    else stat.failCount++;
    stat.elapsedArr.push(row.elapsed);
    if (row.bytes) stat.totalBytes += row.bytes;
    if (row.timeStamp) {
      if (row.timeStamp < stat.minTime) stat.minTime = row.timeStamp;
      if (row.timeStamp > stat.maxTime) stat.maxTime = row.timeStamp;
    }
  }

  const result = Array.from(map.values()).map(stat => {
    stat.elapsedArr.sort((a, b) => a - b);
    const durationSec = stat.minTime !== Infinity && stat.maxTime !== -Infinity ? (stat.maxTime - stat.minTime) / 1000 : 0;
    
    return {
      label: stat.label,
      total: stat.total,
      successCount: stat.successCount,
      failCount: stat.failCount,
      successRate: (stat.successCount / stat.total) * 100,
      failRate: (stat.failCount / stat.total) * 100,
      avg: mean(stat.elapsedArr),
      median: median(stat.elapsedArr),
      p90: percentile(stat.elapsedArr, 90),
      p95: percentile(stat.elapsedArr, 95),
      p99: percentile(stat.elapsedArr, 99),
      min: stat.elapsedArr[0] || 0,
      max: stat.elapsedArr[stat.elapsedArr.length - 1] || 0,
      throughput: durationSec > 0 ? stat.total / durationSec : 0,
      stdDev: stdDev(stat.elapsedArr),
      cv: coefficientOfVariation(stat.elapsedArr),
      avgBytes: stat.totalBytes / stat.total
    };
  });

  result.sort((a, b) => b.total - a.total);
  return result;
}

export function computeTimeSeries(data, bucketMs) {
  if (!data || data.length === 0) return [];

  let minTime = Infinity;
  let maxTime = -Infinity;

  for (const row of data) {
    if (row.timeStamp) {
      if (row.timeStamp < minTime) minTime = row.timeStamp;
      if (row.timeStamp > maxTime) maxTime = row.timeStamp;
    }
  }

  if (minTime === Infinity) return [];

  const durationMs = maxTime - minTime;
  
  if (!bucketMs) {
    if (durationMs < 60000) bucketMs = 1000; // < 1 min -> 1s
    else if (durationMs < 600000) bucketMs = 5000; // < 10 min -> 5s
    else if (durationMs < 3600000) bucketMs = 15000; // < 1 hour -> 15s
    else bucketMs = 60000; // else -> 60s
  }

  const buckets = new Map();

  for (const row of data) {
    if (!row.timeStamp) continue;
    const bucketStart = Math.floor(row.timeStamp / bucketMs) * bucketMs;
    
    if (!buckets.has(bucketStart)) {
      buckets.set(bucketStart, {
        time: bucketStart,
        requests: 0,
        errors: 0,
        elapsedArr: [],
        activeThreads: 0,
        threadsCount: 0
      });
    }
    
    const b = buckets.get(bucketStart);
    b.requests++;
    if (!row.success) b.errors++;
    b.elapsedArr.push(row.elapsed);
    if (row.allThreads != null) {
      b.activeThreads += row.allThreads;
      b.threadsCount++;
    }
  }

  const result = Array.from(buckets.values()).map(b => {
    b.elapsedArr.sort((a, b) => a - b);
    return {
      time: b.time,
      requests: b.requests,
      avgResponseTime: mean(b.elapsedArr),
      p95ResponseTime: percentile(b.elapsedArr, 95),
      maxResponseTime: b.elapsedArr[b.elapsedArr.length - 1] || 0,
      errors: b.errors,
      errorRate: b.requests > 0 ? (b.errors / b.requests) * 100 : 0,
      throughput: b.requests / (bucketMs / 1000),
      activeThreads: b.threadsCount > 0 ? Math.round(b.activeThreads / b.threadsCount) : 0
    };
  });

  result.sort((a, b) => a.time - b.time);
  return result;
}

export function computeErrorBreakdown(data) {
  const codeMap = new Map();
  const msgMap = new Map();

  for (const row of data) {
    if (!row.success) {
      const code = row.responseCode || 'Unknown';
      const msg = row.responseMessage || 'Unknown';
      
      codeMap.set(code, (codeMap.get(code) || 0) + 1);
      msgMap.set(msg, (msgMap.get(msg) || 0) + 1);
    }
  }

  const topCodes = Array.from(codeMap.entries())
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);

  const topMessages = Array.from(msgMap.entries())
    .map(([message, count]) => ({ message, count }))
    .sort((a, b) => b.count - a.count);

  return { topCodes, topMessages };
}

export function computeResponseTimeDistribution(data) {
  if (!data || data.length === 0) return [];

  const elapsedArr = data.map(r => r.elapsed).sort((a, b) => a - b);
  const min = elapsedArr[0];
  const max = elapsedArr[elapsedArr.length - 1];
  
  if (min === max) {
    return [{ range: `${min}ms`, rangeStart: min, rangeEnd: max, count: elapsedArr.length }];
  }

  const bucketCount = Math.min(50, Math.max(10, Math.floor(Math.sqrt(data.length))));
  const bucketSize = (max - min) / bucketCount;
  
  const buckets = Array.from({ length: bucketCount }, (_, i) => ({
    rangeStart: min + i * bucketSize,
    rangeEnd: min + (i + 1) * bucketSize,
    count: 0
  }));

  for (const val of elapsedArr) {
    let idx = Math.floor((val - min) / bucketSize);
    if (idx >= bucketCount) idx = bucketCount - 1;
    buckets[idx].count++;
  }

  return buckets.map(b => ({
    range: `${Math.round(b.rangeStart)}-${Math.round(b.rangeEnd)}ms`,
    rangeStart: b.rangeStart,
    rangeEnd: b.rangeEnd,
    count: b.count
  }));
}

export function getUniqueValues(data, field) {
  const set = new Set();
  for (const row of data) {
    const val = row[field];
    if (val != null && val !== '') {
      set.add(String(val));
    }
  }
  return Array.from(set).sort();
}

export function getThreadGroups(data) {
  const set = new Set();
  for (const row of data) {
    if (row.threadName) {
      const name = row.threadName.replace(/ \d+-\d+$/, '');
      if (name) set.add(name);
    }
  }
  return Array.from(set).sort();
}

export function filterData(data, filters) {
  if (!data || !filters) return data;

  return data.filter(row => {
    if (filters.timeRange && row.timeStamp) {
      if (row.timeStamp < filters.timeRange[0] || row.timeStamp > filters.timeRange[1]) return false;
    }
    
    if (filters.labels && filters.labels.length > 0) {
      if (!filters.labels.includes(row.label)) return false;
    }
    
    if (filters.responseCodes && filters.responseCodes.length > 0) {
      if (!filters.responseCodes.includes(row.responseCode)) return false;
    }
    
    if (filters.success !== null) {
      if (row.success !== filters.success) return false;
    }
    
    if (filters.threadGroups && filters.threadGroups.length > 0) {
      const tg = row.threadName ? row.threadName.replace(/ \d+-\d+$/, '') : '';
      if (!filters.threadGroups.includes(tg)) return false;
    }
    
    if (filters.search) {
      const s = filters.search.toLowerCase();
      const match = 
        (row.label && row.label.toLowerCase().includes(s)) ||
        (row.responseCode && row.responseCode.toLowerCase().includes(s)) ||
        (row.responseMessage && row.responseMessage.toLowerCase().includes(s)) ||
        (row.threadName && row.threadName.toLowerCase().includes(s)) ||
        (row.url && row.url.toLowerCase().includes(s));
      if (!match) return false;
    }
    
    return true;
  });
}
