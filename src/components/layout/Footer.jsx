import React from 'react';
import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low w-full py-6 border-t border-outline-variant/30 mt-auto">
      <div className="w-full px-8 md:px-12 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-inter">
        <div className="flex items-center gap-4">
          <div className="text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>bar_chart_4_bars</span>
            JTL Visualizer
          </div>
          <span className="text-outline/30">|</span>
          <a href="https://github.com/nagarjunx/jtl_visualizer" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1.5 font-medium">
            <Github size={14} /> GitHub
          </a>
          <span className="px-2 py-0.5 bg-primary/10 text-primary border border-primary/20 rounded-full text-[10px] font-bold tracking-wider">v2.1.0</span>
        </div>
        <p className="text-on-surface-variant/60 font-medium">
          &copy; {new Date().getFullYear()} JTL Visualizer &middot; Built with <span className="text-error/80">❤️</span> by <span className="text-on-surface font-bold">Nagarjuna</span>
        </p>
      </div>
    </footer>
  );
}

