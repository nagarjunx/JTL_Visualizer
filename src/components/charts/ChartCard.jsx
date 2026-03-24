import React, { useRef } from 'react';
import { Download } from 'lucide-react';
import { cn } from '../../lib/utils';
import { toPng } from 'html-to-image';

export default function ChartCard({ title, subtitle, children, className, exportable = true, id }) {
  const chartRef = useRef(null);

  const handleExport = async () => {
    if (!chartRef.current) return;
    try {
      const dataUrl = await toPng(chartRef.current, {
        pixelRatio: 2,
        backgroundColor: document.documentElement.classList.contains('dark') ? '#111827' : '#ffffff',
      });
      const link = document.createElement('a');
      link.download = `${title.replace(/\s+/g, '_').toLowerCase()}_chart.png`;
      link.href = dataUrl;
      link.click();
    } catch (err) {
      console.error('Failed to export chart', err);
    }
  };

  return (
    <div id={id} className={cn('glass rounded-xl p-4 flex flex-col', className)} ref={chartRef}>
      <div className="flex justify-between items-start mb-4">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">{title}</h3>
          {subtitle && <p className="text-sm text-gray-500 dark:text-gray-400">{subtitle}</p>}
        </div>
        {exportable && (
          <button
            onClick={handleExport}
            className="p-1.5 text-gray-400 hover:text-brand-500 hover:bg-brand-50 dark:hover:bg-brand-900/20 rounded-md transition-colors"
            title="Export as PNG"
          >
            <Download size={18} />
          </button>
        )}
      </div>
      <div className="flex-1 w-full relative">
        {children}
      </div>
    </div>
  );
}
