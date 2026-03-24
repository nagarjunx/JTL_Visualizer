export class Histogram {
  constructor(maxExpectedValue = 60000, bucketSize = 10) {
    this.bucketSize = bucketSize;
    this.buckets = new Map();
    this.totalCount = 0;
    this.maxValue = 0;
    this.minValue = Infinity;
  }

  recordValue(value) {
    if (value == null || isNaN(value)) return;
    
    this.totalCount++;
    if (value > this.maxValue) this.maxValue = value;
    if (value < this.minValue) this.minValue = value;

    const bucketIndex = Math.floor(value / this.bucketSize);
    this.buckets.set(bucketIndex, (this.buckets.get(bucketIndex) || 0) + 1);
  }

  getPercentile(percentile) {
    if (this.totalCount === 0) return 0;
    if (percentile <= 0) return this.minValue;
    if (percentile >= 100) return this.maxValue;

    const targetCount = (percentile / 100) * this.totalCount;
    let currentCount = 0;

    // Sort bucket indices to iterate in order
    const sortedIndices = Array.from(this.buckets.keys()).sort((a, b) => a - b);

    for (const index of sortedIndices) {
      const countInBucket = this.buckets.get(index);
      currentCount += countInBucket;

      if (currentCount >= targetCount) {
        // We found the bucket containing our percentile
        // Return the upper bound of this bucket as an approximation
        return (index + 1) * this.bucketSize;
      }
    }

    return this.maxValue;
  }
}
