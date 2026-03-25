import React from 'react';
import { Github } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="bg-surface-container-low w-full py-8 border-t border-outline-variant/30 mt-auto">
      <div className="max-w-[1200px] mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-6 text-sm font-inter">
        <div className="flex items-center gap-4">
          <div className="text-on-surface font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-primary text-lg" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>bar_chart_4_bars</span>
            JTL Visualizer
          </div>
          <span className="text-outline/30">|</span>
          <a href="https://github.com/nagarjunx/JTL_Visualizer" target="_blank" rel="noopener noreferrer" className="text-on-surface-variant hover:text-on-surface transition-colors flex items-center gap-1.5 font-medium">
            <Github size={14} /> GitHub
          </a>
        </div>
        <p className="text-on-surface-variant/60 font-medium">
          &copy; {new Date().getFullYear()} JTL Visualizer &middot; Built with <span className="text-error/80">❤️</span> by <span className="text-on-surface font-bold">Nagarjuna</span>
        </p>
      </div>
    </footer>
  );
}

