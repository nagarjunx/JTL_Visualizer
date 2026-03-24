import { describe, it, expect } from 'vitest';
import { formatMs, formatBytes, percentile, mean } from './utils';

describe('utils.js', () => {
  describe('formatMs', () => {
    it('formats milliseconds correctly', () => {
      expect(formatMs(500)).toBe('500ms');
    });

    it('converts to seconds when >= 1000ms', () => {
      expect(formatMs(1500)).toBe('1.50s');
      expect(formatMs(2000)).toBe('2.00s');
    });

    it('handles null or undefined', () => {
      expect(formatMs(null)).toBe('0ms');
    });
  });

  describe('formatBytes', () => {
    it('formats bytes correctly', () => {
      expect(formatBytes(500)).toBe('500 B');
    });

    it('converts to KB when >= 1024 bytes', () => {
      expect(formatBytes(1500)).toBe('1.46 KB');
    });

    it('converts to MB when >= 1048576 bytes', () => {
      expect(formatBytes(2500000)).toBe('2.38 MB');
    });
  });

  describe('Math functions', () => {
    it('calculates mean correctly', () => {
      expect(mean([10, 20, 30])).toBe(20);
      expect(mean([])).toBe(0);
    });

    it('calculates percentiles correctly', () => {
      const sortedArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
      expect(percentile(sortedArr, 50)).toBe(5.5); // Median
      expect(percentile(sortedArr, 90)).toBe(9.1); // 90th percentile
    });
  });
});
