import { describe, it, expect } from 'vitest';
import { StreamingAggregator } from './streamingAggregator';

describe('StreamingAggregator', () => {
  it('should initialize correctly', () => {
    const aggregator = new StreamingAggregator();
    expect(aggregator.total).toBe(0);
    expect(aggregator.successCount).toBe(0);
    expect(aggregator.failCount).toBe(0);
    expect(aggregator.labelMap.size).toBe(0);
  });

  it('should process rows and aggregate stats', () => {
    const aggregator = new StreamingAggregator();
    
    aggregator.processRow({
      timeStamp: 1000,
      elapsed: 100,
      label: 'GET /api/users',
      success: true,
      bytes: 500
    });
    
    aggregator.processRow({
      timeStamp: 2000,
      elapsed: 200,
      label: 'GET /api/users',
      success: false,
      bytes: 100
    });
    
    aggregator.processRow({
      timeStamp: 3000,
      elapsed: 150,
      label: 'POST /api/users',
      success: true,
      bytes: 1000
    });

    const results = aggregator.getResults();
    
    expect(results.stats.total).toBe(3);
    expect(results.stats.successCount).toBe(2);
    expect(results.stats.failCount).toBe(1);
    
    expect(results.perLabelStats.length).toBe(2);
    
    const getUsersStat = results.perLabelStats.find(s => s.label === 'GET /api/users');
    expect(getUsersStat.total).toBe(2);
    expect(getUsersStat.successCount).toBe(1);
    expect(getUsersStat.failCount).toBe(1);
    expect(getUsersStat.avg).toBe(150); // (100 + 200) / 2
    
    const postUsersStat = results.perLabelStats.find(s => s.label === 'POST /api/users');
    expect(postUsersStat.total).toBe(1);
    expect(postUsersStat.successCount).toBe(1);
    expect(postUsersStat.avg).toBe(150);
  });

  it('should calculate throughput correctly', () => {
    const aggregator = new StreamingAggregator();
    
    aggregator.processRow({ timeStamp: 1000, elapsed: 100, success: true });
    aggregator.processRow({ timeStamp: 2000, elapsed: 100, success: true });
    aggregator.processRow({ timeStamp: 3000, elapsed: 100, success: true });
    
    const results = aggregator.getResults();
    
    // Duration is 3000 - 1000 = 2000ms = 2s
    // 3 requests in 2 seconds = 1.5 req/s
    expect(results.stats.durationSec).toBe(2);
    expect(results.stats.throughput).toBe(1.5);
  });

  it('should maintain a sample of filteredData', () => {
    const aggregator = new StreamingAggregator();
    aggregator.maxSampleRows = 1000;
    
    for (let i = 0; i < 1500; i++) {
      aggregator.processRow({ timeStamp: i * 1000, elapsed: 100, success: true });
    }
    
    const results = aggregator.getResults();
    
    expect(results.stats.total).toBe(1500);
    expect(results.filteredData.length).toBe(1000); // Max sample size
  });
});
