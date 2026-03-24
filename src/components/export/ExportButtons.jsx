import React, { useContext } from 'react';
import { Download, FileText, BarChart2, List } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { downloadCSV, formatMs, formatPercent } from '../../lib/utils';

export default function ExportButtons() {
  const { state } = useContext(AppContext);
  const { filteredData, stats, perLabelStats, fileName } = state;

  const baseFilename = fileName ? fileName.replace(/\.[^/.]+$/, "") : "jtl_export";
  const dateStr = new Date().toISOString().slice(0, 10);

  const exportFilteredData = () => {
    if (!filteredData || filteredData.length === 0) return;
    
    const exportData = filteredData.map(row => ({
      Timestamp: row.timeStamp ? new Date(row.timeStamp).toISOString() : '',
      Label: row.label,
      'Response Time (ms)': row.elapsed,
      'Response Code': row.responseCode,
      'Response Message': row.responseMessage,
      Success: row.success ? 'true' : 'false',
      'Thread Name': row.threadName,
      'Bytes Received': row.bytes || 0,
      'Bytes Sent': row.sentBytes || 0,
      'Latency (ms)': row.latency || 0,
      'Connect Time (ms)': row.connect || 0
    }));

    downloadCSV(exportData, `${baseFilename}_filtered_${dateStr}.csv`);
  };

  const exportSummary = () => {
    if (!stats) return;
    
    const summaryData = [
      { Metric: 'Total Requests', Value: stats.total },
      { Metric: 'Success Count', Value: stats.successCount },
      { Metric: 'Failure Count', Value: stats.failCount },
      { Metric: 'Success Rate', Value: formatPercent(stats.successRate) },
      { Metric: 'Failure Rate', Value: formatPercent(stats.failRate) },
      { Metric: 'Average Response Time', Value: formatMs(stats.avgResponseTime) },
      { Metric: 'Median Response Time', Value: formatMs(stats.medianResponseTime) },
      { Metric: '90th Percentile', Value: formatMs(stats.p90) },
      { Metric: '95th Percentile', Value: formatMs(stats.p95) },
      { Metric: '99th Percentile', Value: formatMs(stats.p99) },
      { Metric: 'Min Response Time', Value: formatMs(stats.minResponseTime) },
      { Metric: 'Max Response Time', Value: formatMs(stats.maxResponseTime) },
      { Metric: 'Throughput (req/s)', Value: stats.throughput.toFixed(2) },
      { Metric: 'Test Duration (s)', Value: stats.durationSec.toFixed(2) }
    ];

    downloadCSV(summaryData, `${baseFilename}_summary_${dateStr}.csv`);
  };

  const exportEndpoints = () => {
    if (!perLabelStats || perLabelStats.length === 0) return;
    
    const endpointsData = perLabelStats.map(stat => ({
      Endpoint: stat.label,
      Requests: stat.total,
      'Success Count': stat.successCount,
      'Failure Count': stat.failCount,
      'Success Rate': formatPercent(stat.successRate),
      'Failure Rate': formatPercent(stat.failRate),
      'Average (ms)': Math.round(stat.avg),
      'Median (ms)': Math.round(stat.median),
      '90th Percentile (ms)': Math.round(stat.p90),
      '95th Percentile (ms)': Math.round(stat.p95),
      '99th Percentile (ms)': Math.round(stat.p99),
      'Min (ms)': Math.round(stat.min),
      'Max (ms)': Math.round(stat.max),
      'Throughput (req/s)': stat.throughput.toFixed(2),
      'Std Dev (ms)': Math.round(stat.stdDev),
      'Avg Bytes': Math.round(stat.avgBytes)
    }));

    downloadCSV(endpointsData, `${baseFilename}_endpoints_${dateStr}.csv`);
  };

  return (
    <div className="flex flex-wrap gap-2">
      <button
        onClick={exportFilteredData}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
        title="Export sample of filtered requests (max 100,000)"
      >
        <List size={16} className="text-gray-500 dark:text-gray-400" />
        <span>Sample Data</span>
      </button>
      
      <button
        onClick={exportSummary}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
        title="Export overall summary metrics"
      >
        <BarChart2 size={16} className="text-gray-500 dark:text-gray-400" />
        <span>Summary</span>
      </button>
      
      <button
        onClick={exportEndpoints}
        className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-brand-500 dark:bg-gray-800 dark:text-gray-200 dark:border-gray-700 dark:hover:bg-gray-700 transition-colors"
        title="Export per-endpoint statistics"
      >
        <FileText size={16} className="text-gray-500 dark:text-gray-400" />
        <span>Endpoints</span>
      </button>
    </div>
  );
}
