import { Histogram } from './histogram';

export class StreamingAggregator {
  constructor(filters = {}) {
    this.filters = filters;
    
    // Overall Stats
    this.total = 0;
    this.successCount = 0;
    this.failCount = 0;
    this.totalBytes = 0;
    this.totalSentBytes = 0;
    this.totalLatency = 0;
    this.totalConnect = 0;
    this.minTime = Infinity;
    this.maxTime = -Infinity;
    this.sumResponseTime = 0;
    this.overallHistogram = new Histogram(60000, 10);
    
    // Per Label Stats
    this.labelMap = new Map();
    
    // Time Series (1-minute buckets by default, will adjust later if needed)
    this.timeSeriesMap = new Map();
    this.bucketMs = 60000; // 1 minute
    
    // Error Breakdown
    this.codeMap = new Map();
    this.msgMap = new Map();
    
    // Available Options for Filters
    this.availableLabels = new Set();
    this.availableResponseCodes = new Set();
    this.availableThreadGroups = new Set();
    
    // Sample rows for raw data view
    this.filteredData = [];
    this.maxSampleRows = 100000;
  }

  processRow(row) {
    // 1. Collect available options (ignoring filters)
    if (row.label) this.availableLabels.add(row.label);
    if (row.responseCode) this.availableResponseCodes.add(row.responseCode);
    if (row.threadName) {
      const tg = row.threadName.replace(/ \d+-\d+$/, '');
      if (tg) this.availableThreadGroups.add(tg);
    }

    // 2. Apply Filters
    if (!this.matchesFilters(row)) return;
    
    // Keep a sample of rows for the raw data table
    if (this.filteredData.length < this.maxSampleRows) {
      this.filteredData.push(row);
    }

    // 3. Aggregate Overall
    this.total++;
    if (row.success) this.successCount++;
    else this.failCount++;

    if (row.bytes) this.totalBytes += row.bytes;
    if (row.sentBytes) this.totalSentBytes += row.sentBytes;
    if (row.latency) this.totalLatency += row.latency;
    if (row.connect) this.totalConnect += row.connect;

    if (row.timeStamp) {
      if (row.timeStamp < this.minTime) this.minTime = row.timeStamp;
      if (row.timeStamp > this.maxTime) this.maxTime = row.timeStamp;
    }

    this.sumResponseTime += row.elapsed;
    this.overallHistogram.recordValue(row.elapsed);

    // 4. Aggregate Per Label
    if (!this.labelMap.has(row.label)) {
      this.labelMap.set(row.label, {
        label: row.label,
        total: 0,
        successCount: 0,
        failCount: 0,
        totalBytes: 0,
        sumResponseTime: 0,
        minTime: Infinity,
        maxTime: -Infinity,
        histogram: new Histogram(60000, 10)
      });
    }
    const lStat = this.labelMap.get(row.label);
    lStat.total++;
    if (row.success) lStat.successCount++;
    else lStat.failCount++;
    if (row.bytes) lStat.totalBytes += row.bytes;
    lStat.sumResponseTime += row.elapsed;
    if (row.timeStamp) {
      if (row.timeStamp < lStat.minTime) lStat.minTime = row.timeStamp;
      if (row.timeStamp > lStat.maxTime) lStat.maxTime = row.timeStamp;
    }
    lStat.histogram.recordValue(row.elapsed);

    // 5. Aggregate Time Series
    if (row.timeStamp) {
      const bucketStart = Math.floor(row.timeStamp / this.bucketMs) * this.bucketMs;
      if (!this.timeSeriesMap.has(bucketStart)) {
        this.timeSeriesMap.set(bucketStart, {
          time: bucketStart,
          requests: 0,
          errors: 0,
          sumResponseTime: 0,
          histogram: new Histogram(60000, 10),
          activeThreads: 0,
          threadsCount: 0
        });
      }
      const tStat = this.timeSeriesMap.get(bucketStart);
      tStat.requests++;
      if (!row.success) tStat.errors++;
      tStat.sumResponseTime += row.elapsed;
      tStat.histogram.recordValue(row.elapsed);
      if (row.allThreads != null) {
        tStat.activeThreads += row.allThreads;
        tStat.threadsCount++;
      }
    }

    // 6. Aggregate Errors
    if (!row.success) {
      const code = row.responseCode || 'Unknown';
      const msg = row.responseMessage || 'Unknown';
      this.codeMap.set(code, (this.codeMap.get(code) || 0) + 1);
      this.msgMap.set(msg, (this.msgMap.get(msg) || 0) + 1);
    }
  }

  matchesFilters(row) {
    const f = this.filters;
    if (!f) return true;

    if (f.timeRange && row.timeStamp) {
      if (row.timeStamp < f.timeRange[0] || row.timeStamp > f.timeRange[1]) return false;
    }
    if (f.labels && f.labels.length > 0 && !f.labels.includes(row.label)) return false;
    if (f.responseCodes && f.responseCodes.length > 0 && !f.responseCodes.includes(row.responseCode)) return false;
    if (f.success !== null && f.success !== undefined && row.success !== f.success) return false;
    if (f.threadGroups && f.threadGroups.length > 0) {
      const tg = row.threadName ? row.threadName.replace(/ \d+-\d+$/, '') : '';
      if (!f.threadGroups.includes(tg)) return false;
    }
    if (f.search) {
      const s = f.search.toLowerCase();
      const match = 
        (row.label && row.label.toLowerCase().includes(s)) ||
        (row.responseCode && row.responseCode.toLowerCase().includes(s)) ||
        (row.responseMessage && row.responseMessage.toLowerCase().includes(s)) ||
        (row.threadName && row.threadName.toLowerCase().includes(s)) ||
        (row.url && row.url.toLowerCase().includes(s));
      if (!match) return false;
    }
    return true;
  }

  getResults() {
    const durationSec = this.minTime !== Infinity && this.maxTime !== -Infinity ? (this.maxTime - this.minTime) / 1000 : 0;
    
    // Finalize Overall Stats
    const stats = {
      total: this.total,
      successCount: this.successCount,
      failCount: this.failCount,
      successRate: this.total > 0 ? (this.successCount / this.total) * 100 : 0,
      failRate: this.total > 0 ? (this.failCount / this.total) * 100 : 0,
      avgResponseTime: this.total > 0 ? this.sumResponseTime / this.total : 0,
      medianResponseTime: this.overallHistogram.getPercentile(50),
      p90: this.overallHistogram.getPercentile(90),
      p95: this.overallHistogram.getPercentile(95),
      p99: this.overallHistogram.getPercentile(99),
      minResponseTime: this.overallHistogram.minValue === Infinity ? 0 : this.overallHistogram.minValue,
      maxResponseTime: this.overallHistogram.maxValue,
      throughput: durationSec > 0 ? this.total / durationSec : 0,
      totalBytes: this.totalBytes,
      totalSentBytes: this.totalSentBytes,
      avgBytes: this.total > 0 ? this.totalBytes / this.total : 0,
      avgLatency: this.total > 0 ? this.totalLatency / this.total : 0,
      avgConnect: this.total > 0 ? this.totalConnect / this.total : 0,
      minTime: this.minTime,
      maxTime: this.maxTime,
      durationSec
    };

    // Finalize Per Label Stats
    const perLabelStats = Array.from(this.labelMap.values()).map(stat => {
      const lDuration = stat.minTime !== Infinity && stat.maxTime !== -Infinity ? (stat.maxTime - stat.minTime) / 1000 : 0;
      return {
        label: stat.label,
        total: stat.total,
        successCount: stat.successCount,
        failCount: stat.failCount,
        successRate: stat.total > 0 ? (stat.successCount / stat.total) * 100 : 0,
        failRate: stat.total > 0 ? (stat.failCount / stat.total) * 100 : 0,
        avg: stat.total > 0 ? stat.sumResponseTime / stat.total : 0,
        median: stat.histogram.getPercentile(50),
        p90: stat.histogram.getPercentile(90),
        p95: stat.histogram.getPercentile(95),
        p99: stat.histogram.getPercentile(99),
        min: stat.histogram.minValue === Infinity ? 0 : stat.histogram.minValue,
        max: stat.histogram.maxValue,
        throughput: lDuration > 0 ? stat.total / lDuration : 0,
        avgBytes: stat.total > 0 ? stat.totalBytes / stat.total : 0
      };
    }).sort((a, b) => b.total - a.total);

    // Finalize Time Series
    const timeSeries = Array.from(this.timeSeriesMap.values()).map(b => ({
      time: b.time,
      requests: b.requests,
      avgResponseTime: b.requests > 0 ? b.sumResponseTime / b.requests : 0,
      p95ResponseTime: b.histogram.getPercentile(95),
      maxResponseTime: b.histogram.maxValue,
      errors: b.errors,
      errorRate: b.requests > 0 ? (b.errors / b.requests) * 100 : 0,
      throughput: b.requests / (this.bucketMs / 1000),
      activeThreads: b.threadsCount > 0 ? Math.round(b.activeThreads / b.threadsCount) : 0
    })).sort((a, b) => a.time - b.time);

    // Finalize Error Breakdown
    const topCodes = Array.from(this.codeMap.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);

    const topMessages = Array.from(this.msgMap.entries())
      .map(([message, count]) => ({ message, count }))
      .sort((a, b) => b.count - a.count);

    const errorBreakdown = { topCodes, topMessages };

    // Finalize Distribution (from overall histogram)
    const distribution = [];
    const sortedIndices = Array.from(this.overallHistogram.buckets.keys()).sort((a, b) => a - b);
    
    if (sortedIndices.length > 0) {
      const minIndex = sortedIndices[0];
      const maxIndex = sortedIndices[sortedIndices.length - 1];
      const minVal = minIndex * this.overallHistogram.bucketSize;
      const maxVal = (maxIndex + 1) * this.overallHistogram.bucketSize;
      
      // Target around 40 bins for the chart
      const targetBins = 40;
      const range = maxVal - minVal;
      let binSize = Math.max(this.overallHistogram.bucketSize, Math.ceil(range / targetBins));
      
      // Round binSize to a nice number (10, 50, 100, 500, etc.)
      const magnitude = Math.pow(10, Math.floor(Math.log10(binSize || 1)));
      if (binSize / magnitude > 5) binSize = 10 * magnitude;
      else if (binSize / magnitude > 2) binSize = 5 * magnitude;
      else if (binSize / magnitude > 1) binSize = 2 * magnitude;
      else binSize = magnitude;
      
      const bins = new Map();
      
      for (const index of sortedIndices) {
        const count = this.overallHistogram.buckets.get(index);
        const val = index * this.overallHistogram.bucketSize;
        const binIndex = Math.floor(val / binSize);
        bins.set(binIndex, (bins.get(binIndex) || 0) + count);
      }
      
      const sortedBinIndices = Array.from(bins.keys()).sort((a, b) => a - b);
      for (const binIndex of sortedBinIndices) {
        const count = bins.get(binIndex);
        const rangeStart = binIndex * binSize;
        const rangeEnd = rangeStart + binSize;
        distribution.push({
          range: `${rangeStart}-${rangeEnd}ms`,
          rangeStart,
          rangeEnd,
          count
        });
      }
    }

    return {
      stats,
      perLabelStats,
      timeSeries,
      errorBreakdown,
      distribution,
      filteredData: this.filteredData,
      availableLabels: Array.from(this.availableLabels).sort(),
      availableResponseCodes: Array.from(this.availableResponseCodes).sort(),
      availableThreadGroups: Array.from(this.availableThreadGroups).sort()
    };
  }
}
