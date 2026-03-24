import React from 'react';
import { Github, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer className="w-full bg-white dark:bg-[#090b11] border-t border-gray-200 dark:border-gray-800/50 py-4 px-6 flex flex-col sm:flex-row items-center justify-between text-sm z-20 mt-auto">
      <div className="flex-1 text-left text-gray-500 dark:text-gray-400">
        &copy; {new Date().getFullYear()} JMeter Dashboard Visualizer
      </div>

      <div className="flex-1 text-center flex items-center justify-center gap-1.5 text-gray-500 dark:text-gray-400">
        Built with <Heart size={14} className="text-pink-500 fill-pink-500" /> by Nagarjuna
      </div>

      <div className="flex-1 flex justify-end">
        <a
          href="https://github.com/nagarjunx"
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center gap-2 text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors font-medium"
        >
          <Github size={16} />
          <span>GitHub</span>
        </a>
      </div>
    </footer>
  );
}
