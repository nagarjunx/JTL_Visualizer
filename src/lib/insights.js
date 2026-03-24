export function generateInsights(overallStats, perLabelStats, timeSeries, errorBreakdown) {
  const insights = [];

  if (!overallStats || !perLabelStats || !timeSeries || !errorBreakdown) return insights;

  // 1. P99 > 3x median
  if (overallStats.p99 > 3 * overallStats.medianResponseTime) {
    insights.push({
      severity: 'high',
      category: 'performance',
      title: 'Extreme tail latency detected',
      description: `The 99th percentile response time (${Math.round(overallStats.p99)}ms) is more than 3x the median (${Math.round(overallStats.medianResponseTime)}ms).`,
      recommendation: 'Investigate slow database queries, garbage collection pauses, or resource contention affecting a small percentage of requests.'
    });
  }

  // 2. P95 > 2x median
  if (overallStats.p95 > 2 * overallStats.medianResponseTime && overallStats.p99 <= 3 * overallStats.medianResponseTime) {
    insights.push({
      severity: 'medium',
      category: 'performance',
      title: 'Elevated tail latency',
      description: `The 95th percentile response time (${Math.round(overallStats.p95)}ms) is more than 2x the median (${Math.round(overallStats.medianResponseTime)}ms).`,
      recommendation: 'Look for intermittent bottlenecks or inefficient processing paths for specific request types.'
    });
  }

  // 3. failRate > 5%
  if (overallStats.failRate > 5) {
    insights.push({
      severity: 'high',
      category: 'reliability',
      title: 'High overall failure rate',
      description: `The overall failure rate is ${overallStats.failRate.toFixed(2)}%, which indicates significant instability.`,
      recommendation: 'Review the Errors tab to identify the most common error codes and messages. Check server logs for corresponding exceptions.'
    });
  }

  // 4. failRate > 1%
  if (overallStats.failRate > 1 && overallStats.failRate <= 5) {
    insights.push({
      severity: 'medium',
      category: 'reliability',
      title: 'Moderate failure rate',
      description: `The overall failure rate is ${overallStats.failRate.toFixed(2)}%.`,
      recommendation: 'Investigate the root cause of these failures to prevent them from escalating under higher load.'
    });
  }

  // 5. Endpoints with >10% fail rate & >5 requests
  const highFailEndpoints = perLabelStats.filter(s => s.failRate > 10 && s.total > 5);
  if (highFailEndpoints.length > 0) {
    insights.push({
      severity: 'high',
      category: 'reliability',
      title: `${highFailEndpoints.length} endpoint(s) with high failure rates`,
      description: `Found ${highFailEndpoints.length} endpoint(s) failing more than 10% of the time.`,
      recommendation: 'Focus debugging efforts on these specific endpoints. Check for missing dependencies, bad data handling, or timeouts.'
    });
  }

  // 6. Endpoints with avg > 2x overall avg & >5 requests
  const slowEndpoints = perLabelStats.filter(s => s.avg > 2 * overallStats.avgResponseTime && s.total > 5);
  if (slowEndpoints.length > 0) {
    insights.push({
      severity: 'medium',
      category: 'performance',
      title: `${slowEndpoints.length} endpoint(s) significantly slower than average`,
      description: `Found ${slowEndpoints.length} endpoint(s) with average response times more than 2x the overall average.`,
      recommendation: 'Profile these specific endpoints to identify performance bottlenecks.'
    });
  }

  // 7. Endpoints with CV > 100% & >10 requests
  const highVarEndpoints = perLabelStats.filter(s => s.cv > 100 && s.total > 10);
  if (highVarEndpoints.length > 0) {
    insights.push({
      severity: 'medium',
      category: 'stability',
      title: 'Endpoints with highly variable response times',
      description: `Found ${highVarEndpoints.length} endpoint(s) with a Coefficient of Variation > 100%.`,
      recommendation: 'Investigate why these endpoints have inconsistent performance. Look for caching issues or variable payload sizes.'
    });
  }

  // 8. Time periods with avg RT > mean + 3σ
  const tsAvgArr = timeSeries.map(t => t.avgResponseTime).filter(v => v > 0);
  if (tsAvgArr.length > 0) {
    const tsMean = tsAvgArr.reduce((a, b) => a + b, 0) / tsAvgArr.length;
    const tsStdDev = Math.sqrt(tsAvgArr.reduce((a, b) => a + Math.pow(b - tsMean, 2), 0) / tsAvgArr.length);
    const spikes = timeSeries.filter(t => t.avgResponseTime > tsMean + 3 * tsStdDev);
    if (spikes.length > 0) {
      insights.push({
        severity: 'high',
        category: 'performance',
        title: `${spikes.length} response time spike(s) detected`,
        description: `Detected ${spikes.length} period(s) where average response time spiked significantly above normal levels.`,
        recommendation: 'Correlate these spikes with throughput, active threads, or external events (e.g., cron jobs, backups).'
      });
    }
  }

  // 9. Time periods with error rate > mean + 3σ & >5%
  const tsErrArr = timeSeries.map(t => t.errorRate).filter(v => v > 0);
  if (tsErrArr.length > 0) {
    const errMean = tsErrArr.reduce((a, b) => a + b, 0) / tsErrArr.length;
    const errStdDev = Math.sqrt(tsErrArr.reduce((a, b) => a + Math.pow(b - errMean, 2), 0) / tsErrArr.length);
    const errSpikes = timeSeries.filter(t => t.errorRate > errMean + 3 * errStdDev && t.errorRate > 5);
    if (errSpikes.length > 0) {
      insights.push({
        severity: 'high',
        category: 'reliability',
        title: 'Error rate spikes detected',
        description: `Detected ${errSpikes.length} period(s) with unusually high error rates.`,
        recommendation: 'Check if these spikes correlate with high load or specific backend events.'
      });
    }
  }

  // 10. 5xx error codes in top 3
  const top3Codes = errorBreakdown.topCodes.slice(0, 3).map(c => c.code);
  const has5xx = top3Codes.some(c => String(c).startsWith('5'));
  if (has5xx) {
    insights.push({
      severity: 'high',
      category: 'errors',
      title: 'Server-side errors (5xx) detected',
      description: 'One or more 5xx HTTP status codes are among the most frequent errors.',
      recommendation: 'Investigate server logs for unhandled exceptions, crashes, or gateway timeouts.'
    });
  }

  // 11. 4xx error codes in top 3
  const has4xx = top3Codes.some(c => String(c).startsWith('4'));
  if (has4xx && !has5xx) {
    insights.push({
      severity: 'medium',
      category: 'errors',
      title: 'Client-side errors (4xx) detected',
      description: 'One or more 4xx HTTP status codes are among the most frequent errors.',
      recommendation: 'Verify test data, authentication credentials, and request formats.'
    });
  }

  // 12. Throughput < 1 req/s & >100 total
  if (overallStats.throughput < 1 && overallStats.total > 100) {
    insights.push({
      severity: 'low',
      category: 'performance',
      title: 'Low throughput detected',
      description: `Overall throughput is ${overallStats.throughput.toFixed(2)} requests/second.`,
      recommendation: 'If this is a load test, consider increasing the number of concurrent threads or reducing think times.'
    });
  }

  // 13. Avg latency > 2x processing time
  const processingTime = overallStats.avgResponseTime - overallStats.avgLatency;
  if (overallStats.avgLatency > 0 && processingTime > 0 && overallStats.avgLatency > 2 * processingTime) {
    insights.push({
      severity: 'medium',
      category: 'network',
      title: 'High network latency relative to processing time',
      description: 'The time spent on network transfer (latency) is significantly higher than the server processing time.',
      recommendation: 'Check network conditions between the load generator and the target server. Consider deploying load generators closer to the target.'
    });
  }

  // 14. 0% errors & P95 < 500ms & throughput > 10/s
  if (overallStats.failRate === 0 && overallStats.p95 < 500 && overallStats.throughput > 10) {
    insights.push({
      severity: 'low',
      category: 'positive',
      title: 'Excellent performance profile',
      description: 'The system is handling the load well with 0 errors and fast response times.',
      recommendation: 'Consider increasing the load to find the breaking point of the system.'
    });
  }

  // Sort by severity
  const severityOrder = { high: 0, medium: 1, low: 2 };
  insights.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return insights;
}
