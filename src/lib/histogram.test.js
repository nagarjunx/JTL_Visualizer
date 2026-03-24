import { describe, it, expect } from 'vitest';
import { Histogram } from './histogram';

describe('Histogram', () => {
  it('should initialize correctly', () => {
    const hist = new Histogram(60000, 10);
    expect(hist.bucketSize).toBe(10);
    expect(hist.totalCount).toBe(0);
    expect(hist.maxValue).toBe(0);
    expect(hist.minValue).toBe(Infinity);
  });

  it('should record values correctly', () => {
    const hist = new Histogram(60000, 10);
    hist.recordValue(50);
    hist.recordValue(50);
    hist.recordValue(150);
    
    expect(hist.totalCount).toBe(3);
    expect(hist.maxValue).toBe(150);
    expect(hist.minValue).toBe(50);
  });

  it('should calculate percentiles correctly', () => {
    const hist = new Histogram(60000, 10);
    // Record values 1 to 100
    for (let i = 1; i <= 100; i++) {
      hist.recordValue(i);
    }
    
    expect(hist.totalCount).toBe(100);
    
    const p50 = hist.getPercentile(50);
    const p90 = hist.getPercentile(90);
    const p99 = hist.getPercentile(99);
    
    // Since it's an approximation, we check if it's within a reasonable range
    // Bucket size is 10, so values are grouped in 0-9, 10-19, etc.
    // The getPercentile returns the upper bound of the bucket.
    expect(p50).toBeGreaterThanOrEqual(40);
    expect(p50).toBeLessThanOrEqual(60);
    
    expect(p90).toBeGreaterThanOrEqual(80);
    expect(p90).toBeLessThanOrEqual(100);
    
    expect(p99).toBeGreaterThanOrEqual(90);
    expect(p99).toBeLessThanOrEqual(110);
  });

  it('should return 0 for percentiles when empty', () => {
    const hist = new Histogram(60000, 10);
    expect(hist.getPercentile(50)).toBe(0);
  });
});
