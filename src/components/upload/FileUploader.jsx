import React, { useContext, useState, useRef } from 'react';
import { UploadCloud, CheckCircle2, Shield, Loader2, AlertCircle } from 'lucide-react';
import { AppContext } from '../../context/AppContext';
import { cn } from '../../lib/utils';
import ParserWorker from '../../workers/jtlParser.worker.js?worker';
import { parseJTL } from '../../lib/parser';

export default function FileUploader() {
  const { state, dispatch } = useContext(AppContext);
  const { isParsing, parseProgress, parseError } = state;
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);
  const workerRef = useRef(null);

  const handleFile = async (file) => {
    if (!file) return;

    dispatch({ type: 'SET_PARSING', payload: true });

    try {
      if (window.Worker) {
        workerRef.current = new ParserWorker();
        workerRef.current.onmessage = (event) => {
          const { type, value, data, fileName, message } = event.data;
          if (type === 'progress') dispatch({ type: 'SET_PARSE_PROGRESS', payload: value });
          else if (type === 'complete') {
            dispatch({ type: 'SET_RAW_DATA', payload: { data, fileName, file } });
            workerRef.current.terminate();
          } else if (type === 'error') {
            dispatch({ type: 'SET_PARSE_ERROR', payload: message });
            workerRef.current.terminate();
          }
        };
        workerRef.current.postMessage({ file, fileName: file.name, filters: {} });
      } else {
        const reader = new FileReader();
        reader.onload = async (e) => {
          try {
            const rows = await parseJTL(e.target.result, (p) => dispatch({ type: 'SET_PARSE_PROGRESS', payload: p }));
            dispatch({ type: 'SET_RAW_DATA', payload: { data: rows, fileName: file.name, file } });
          } catch (err) { dispatch({ type: 'SET_PARSE_ERROR', payload: err.message }); }
        };
        reader.onerror = () => dispatch({ type: 'SET_PARSE_ERROR', payload: 'Failed to read file' });
        reader.readAsText(file);
      }
    } catch (err) { dispatch({ type: 'SET_PARSE_ERROR', payload: err.message }); }
  };

  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault(); setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) handleFile(e.dataTransfer.files[0]);
  };
  const onFileChange = (e) => {
    if (e.target.files && e.target.files.length > 0) handleFile(e.target.files[0]);
  };
  const triggerUpload = () => fileInputRef.current?.click();

  if (isParsing) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] p-8">
        <div className="glass-card rounded-2xl p-10 max-w-md w-full text-center shadow-xl animate-fade-in">
          <div className="w-20 h-20 mx-auto bg-primary/20 text-primary rounded-full flex items-center justify-center mb-6 relative">
            <Loader2 size={40} className="animate-spin" />
            <div className="absolute inset-0 rounded-full border-4 border-primary/30"></div>
          </div>
          <h2 className="text-2xl font-bold text-on-surface mb-2">Parsing JTL File...</h2>
          <p className="text-on-surface-variant mb-8">This might take a moment for large files.</p>
          <div className="w-full bg-surface-container-highest rounded-full h-3 mb-2 overflow-hidden">
            <div className="bg-primary h-3 rounded-full transition-all duration-300 ease-out" style={{ width: `${parseProgress}%` }}></div>
          </div>
          <div className="flex justify-between text-sm font-medium text-on-surface-variant">
            <span>Processing</span><span>{Math.round(parseProgress)}%</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className={cn("w-full transition-all duration-300", isDragging && "bg-primary/5")}
      onDragOver={onDragOver} onDragLeave={onDragLeave} onDrop={onDrop}
    >
      <input type="file" ref={fileInputRef} onChange={onFileChange} className="hidden" accept=".jtl,.csv,.xml,.txt" />

      {parseError && (
        <div className="max-w-[1200px] mx-auto mt-6 px-6 relative z-50">
          <div className="p-4 bg-error-container/30 border border-error/50 rounded-xl flex items-start gap-3 w-full animate-fade-in">
            <AlertCircle className="text-error shrink-0 mt-0.5" size={20} />
            <div>
              <h4 className="text-sm font-semibold text-error">Error parsing file</h4>
              <p className="text-sm text-on-error-container mt-1">{parseError}</p>
            </div>
          </div>
        </div>
      )}

      {/* Hero Section */}
      <section className="relative pt-32 pb-24 overflow-hidden bg-background">
        <div className="absolute inset-x-0 top-0 h-[800px] pointer-events-none overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,var(--primary),transparent_50%)] opacity-10"></div>
          <div className="absolute top-[20%] left-[10%] w-[500px] h-[500px] bg-primary/10 rounded-full blur-[120px]"></div>
          <div className="absolute top-[10%] right-[10%] w-[400px] h-[400px] bg-tertiary/10 rounded-full blur-[100px]"></div>
        </div>

        <div className="max-w-[1200px] mx-auto px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-surface-container-highest/50 border border-outline-variant/30 text-xs font-semibold text-on-surface-variant mb-8 backdrop-blur-md">
            <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
            v2.0.0 Now Available
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 tracking-tighter text-on-surface">
            Client-Side JMeter Analytics.<br />
            <span className="bg-gradient-to-r from-primary via-on-surface to-tertiary bg-clip-text text-transparent italic pr-2 py-2">No Data Leaves Your Browser.</span>
          </h1>

          <p className="text-lg md:text-xl text-on-surface-variant max-w-2xl mx-auto mb-10 leading-relaxed font-inter font-medium">
            Transform JTL files into interactive dashboards with zero backend overhead. Fast, secure, and fully client-side parsing.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={triggerUpload}
              className={cn(
                "bg-blue-500 hover:bg-blue-400 text-white font-bold py-3 px-8 rounded-lg shadow-lg shadow-blue-500/25 transition-all text-lg flex items-center gap-2",
                isDragging && "scale-105 shadow-[0_0_30px_rgba(59,130,246,0.6)] ring-4 ring-blue-500/30"
              )}
            >
              <span className="material-symbols-outlined z-10 relative">upload_file</span>
              <span className="z-10 relative">{isDragging ? "Drop your file here..." : "Upload JTL File"}</span>
            </button>
          </div>
        </div>
      </section>

      {/* Value Stats */}
      <section className="pb-24">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6 p-8 rounded-2xl bg-surface-container-low/50 border border-outline-variant/10 backdrop-blur-sm">
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-black text-on-surface mb-1">100%</span>
              <span className="text-sm text-on-surface-variant uppercase tracking-widest font-bold">Client-Side</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-black text-on-surface mb-1">WebWorker</span>
              <span className="text-sm text-on-surface-variant uppercase tracking-widest font-bold">Parsing</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-black text-on-surface mb-1">7 Tabs</span>
              <span className="text-sm text-on-surface-variant uppercase tracking-widest font-bold">Dashboards</span>
            </div>
            <div className="flex flex-col items-center text-center">
              <span className="text-3xl font-black text-on-surface mb-1">Zero</span>
              <span className="text-sm text-on-surface-variant uppercase tracking-widest font-bold">Uploads</span>
            </div>
          </div>
        </div>
      </section>

      {/* Dashboard Preview */}
      <section className="py-24 bg-surface-container-low">
        <div className="relative w-full max-w-5xl mx-auto px-6 z-10 group">
          <div className="mb-12 text-center lg:text-left">
            <h2 className="text-3xl md:text-4xl font-bold text-on-surface mb-4">Engineering-Grade Insights</h2>
            <p className="text-on-surface-variant max-w-xl">Deep dive into performance bottlenecks with visualizations designed for high-load analysis.</p>
          </div>
          <div className="glass-card rounded-2xl p-4 md:p-8 shadow-[0_20px_80px_rgba(0,0,0,0.5)] relative overflow-hidden bg-[#0b0f19] border-slate-800/50">
            {/* Dashboard Mock Header - Top Tabs */}
            <div className="flex items-center gap-1 md:gap-4 mb-4 border-b border-slate-800/50 pb-4 overflow-x-auto hide-scrollbar">
              <div className="bg-blue-600/20 text-blue-400 px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 border border-blue-500/20 whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px]">grid_view</span> Overview
              </div>
              <div className="text-slate-400 hover:text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px]">trending_up</span> Trends
              </div>
              <div className="text-slate-400 hover:text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px]">error</span> Errors
              </div>
              <div className="text-slate-400 hover:text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px]">my_location</span> Endpoints
              </div>
              <div className="text-slate-400 hover:text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap">
                <span className="material-symbols-outlined text-[18px]">list</span> Requests
              </div>
              <div className="text-slate-400 hover:text-white px-4 py-2 rounded-lg font-medium text-sm flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap text-opacity-50 hidden sm:flex">
                ...
              </div>
            </div>

            {/* Dashboard Mock Filters */}
            <div className="flex flex-wrap items-center gap-3 mb-8">
              <div className="flex items-center gap-2 bg-[#171d2d] border border-slate-700/50 rounded-lg px-3 py-2 text-slate-400 flex-1 min-w-[200px]">
                <span className="material-symbols-outlined text-[18px]">search</span>
                <span className="text-sm">Search requests...</span>
              </div>
              <div className="flex items-center justify-between gap-4 bg-[#171d2d] border border-slate-700/50 rounded-lg px-3 py-2 text-slate-300 w-32">
                <span className="text-sm">Endpoints</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
              <div className="flex items-center justify-between gap-4 bg-[#171d2d] border border-slate-700/50 rounded-lg px-3 py-2 text-slate-300 w-36">
                <span className="text-sm">Status Codes</span>
                <span className="material-symbols-outlined text-[16px]">expand_more</span>
              </div>
              <div className="flex items-center gap-1 bg-[#171d2d] border border-slate-700/50 rounded-lg p-1 text-slate-300">
                <div className="bg-slate-700 px-3 py-1 rounded text-sm text-white font-medium">All</div>
                <div className="px-3 py-1 rounded text-sm flex items-center gap-1 text-slate-400 hover:text-white">
                  <span className="material-symbols-outlined text-[14px]">check_circle</span> Passed
                </div>
                <div className="px-3 py-1 rounded text-sm flex items-center gap-1 text-slate-400 hover:text-white">
                  <span className="material-symbols-outlined text-[14px]">cancel</span> Failed
                </div>
              </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-10 relative z-10">
              <div className="bg-[#13192b] p-5 rounded-xl border border-slate-800/60 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[11px] text-slate-400 tracking-widest font-bold uppercase">Total Requests</div>
                  <div className="w-6 h-6 rounded-md bg-blue-500/10 text-blue-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">monitoring</span>
                  </div>
                </div>
                <div className="text-3xl font-black text-white mb-1">100.0k</div>
                <div className="text-xs text-slate-500">1999.2s duration</div>
              </div>

              <div className="bg-[#13192b] p-5 rounded-xl border border-slate-800/60 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[11px] text-slate-400 tracking-widest font-bold uppercase">Success Rate</div>
                  <div className="w-6 h-6 rounded-md bg-emerald-500/10 text-emerald-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">check_circle</span>
                  </div>
                </div>
                <div className="text-3xl font-black text-white mb-1">66.42%</div>
                <div className="text-xs text-slate-500">66.4k passed</div>
              </div>

              <div className="bg-[#13192b] p-5 rounded-xl border border-slate-800/60 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[11px] text-slate-400 tracking-widest font-bold uppercase">Error Rate</div>
                  <div className="w-6 h-6 rounded-md bg-rose-500/10 text-rose-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">cancel</span>
                  </div>
                </div>
                <div className="text-3xl font-black text-white mb-1">33.59%</div>
                <div className="text-xs text-slate-500">33.6k failed</div>
              </div>

              <div className="bg-[#13192b] p-5 rounded-xl border border-slate-800/60 shadow-lg">
                <div className="flex justify-between items-start mb-2">
                  <div className="text-[11px] text-slate-400 tracking-widest font-bold uppercase">Avg Response Time</div>
                  <div className="w-6 h-6 rounded-md bg-purple-500/10 text-purple-500 flex items-center justify-center">
                    <span className="material-symbols-outlined text-[14px]">schedule</span>
                  </div>
                </div>
                <div className="text-3xl font-black text-white mb-1">819ms</div>
                <div className="text-xs text-slate-500">790ms median</div>
              </div>
            </div>

            {/* Chart Mock */}
            <div className="h-64 w-full relative group">
              <div className="absolute inset-0 flex items-end justify-between gap-2 px-2">
                <div className="w-full bg-primary/20 rounded-t h-[40%] group-hover:h-[45%] transition-all duration-500"></div>
                <div className="w-full bg-primary/20 rounded-t h-[65%] group-hover:h-[70%] transition-all duration-500"></div>
                <div className="w-full bg-primary/40 rounded-t h-[55%] group-hover:h-[60%] transition-all duration-500 border-t-2 border-primary"></div>
                <div className="w-full bg-primary/20 rounded-t h-[80%] group-hover:h-[85%] transition-all duration-500"></div>
                <div className="w-full bg-primary/30 rounded-t h-[45%] group-hover:h-[50%] transition-all duration-500"></div>
                <div className="w-full bg-primary/50 rounded-t h-[90%] group-hover:h-[95%] transition-all duration-500 border-t-2 border-primary"></div>
                <div className="w-full bg-primary/20 rounded-t h-[75%] group-hover:h-[80%] transition-all duration-500"></div>
                <div className="w-full bg-primary/40 rounded-t h-[60%] group-hover:h-[65%] transition-all duration-500"></div>
                <div className="w-full bg-primary/20 rounded-t h-[30%] group-hover:h-[35%] transition-all duration-500"></div>
                <div className="w-full bg-primary/60 rounded-t h-[100%] group-hover:h-[95%] transition-all duration-500 border-t-2 border-primary"></div>
                <div className="w-full bg-primary/20 rounded-t h-[85%] group-hover:h-[90%] transition-all duration-500"></div>
                <div className="w-full bg-primary/20 rounded-t h-[50%] group-hover:h-[55%] transition-all duration-500"></div>
              </div>
              <div className="absolute top-0 left-0 w-full h-full pointer-events-none border-b border-l border-outline-variant/30 flex items-center justify-center">
                <span className="text-xs text-on-surface-variant font-medium opacity-50">Response Time Trends (ms)</span>
              </div>
            </div>
            <div className="mt-4 flex justify-between text-[10px] text-on-surface-variant font-bold uppercase tracking-wider relative z-10">
              <span>09:00</span><span>09:15</span><span>09:30</span><span>09:45</span><span>10:00</span>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-24 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard icon="bolt" title="Web Worker Powered" desc="Fast, non-blocking parsing of heavy CSV and XML JTL files without freezing your UI." />
            <FeatureCard icon="smart_toy" title="14 Auto-Insights" desc="Smart rules to detect latency spikes, error rate jumps, and server bottlenecks automatically." />
            <FeatureCard icon="compare" title="Side-by-Side Comparison" desc="Compare up to 4 endpoints with radar charts and detailed cross-run metrics side-by-side." />
            <FeatureCard icon="query_stats" title="Rich Visualizations" desc="Response time trends, throughput, error rates, and thread counts in high-res fidelity." />
            <FeatureCard icon="auto_awesome" title="Universal Support" desc="Maps over 50 JTL column aliases to a canonical schema automatically without configuration." />
            <FeatureCard icon="download" title="Export Anywhere" desc="Save your insights as CSV and your charts as high-resolution PNGs for reporting." />
          </div>
        </div>
      </section>

      {/* Privacy & Security Section */}
      <section id="security" className="py-32 bg-surface-container-low overflow-hidden relative">
        <div className="max-w-[1200px] mx-auto px-6 grid md:grid-cols-2 gap-16 items-center">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-lg bg-tertiary/10 text-tertiary text-xs font-bold uppercase tracking-wider mb-6">
              <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>verified_user</span>
              Privacy First
            </div>
            <h2 className="text-4xl md:text-5xl font-black text-on-surface mb-8 leading-tight">Private by Design.<br />Truly Local.</h2>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-10">
              In an era of data leaks, JTL Visualizer stands apart. All parsing, analysis, and rendering happen locally in your browser memory. We have no backend, no databases, and no tracking scripts. Your performance data stays exactly where it should: with you.
            </p>
            <ul className="space-y-4">
              <li className="flex items-center gap-3 text-on-surface font-medium">
                <CheckCircle2 className="text-tertiary" size={20} /> Zero Cloud Latency
              </li>
              <li className="flex items-center gap-3 text-on-surface font-medium">
                <CheckCircle2 className="text-tertiary" size={20} /> No Cookies or Tracking
              </li>
              <li className="flex items-center gap-3 text-on-surface font-medium">
                <CheckCircle2 className="text-tertiary" size={20} /> Compliant with Enterprise Security
              </li>
            </ul>
          </div>
          <div className="relative">
            <div className="bg-gradient-to-tr from-surface-container-highest to-surface-variant p-1 rounded-[2rem] shadow-2xl">

              <div className="bg-surface-container-lowest rounded-[1.8rem] aspect-square flex items-center justify-center p-6 overflow-hidden relative">

                {/* Subtle glow */}
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(0,165,114,0.08),transparent_60%)]"></div>

                {/* Centered content */}
                <div className="flex flex-col items-center justify-center h-full translate-y-4">

                  {/* Lock Icon */}
                  <span
                    className="material-symbols-outlined text-tertiary leading-none"
                    style={{
                      fontVariationSettings: "'FILL' 1, 'wght' 500, 'opsz' 48",
                      fontSize: "80px"
                    }}
                  >
                    lock
                  </span>

                </div>

                {/* Bottom Text */}
                <div className="absolute bottom-10 left-0 right-0 text-center">
                  <span className="text-tertiary font-mono text-xs tracking-[0.25em] opacity-90">
                    ENCRYPTED_SESSION_ACTIVE
                  </span>
                </div>

              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Tech Stack & Steps */}
      <section id="documentation" className="py-24 bg-surface">
        <div className="max-w-[1200px] mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-on-surface mb-4">Built on Modern Foundations</h2>
            <p className="text-on-surface-variant">Powering the fastest visualization engine for performance engineers.</p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 mb-24 opacity-60">
            <div className="flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-default">
              <span className="text-2xl font-black text-on-surface italic">REACT</span>
            </div>
            <div className="flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-default">
              <span className="text-2xl font-black text-on-surface italic">VITE</span>
            </div>
            <div className="flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-default">
              <span className="text-2xl font-black text-on-surface italic">TAILWIND</span>
            </div>
            <div className="flex items-center justify-center grayscale hover:grayscale-0 transition-all cursor-default">
              <span className="text-2xl font-black text-on-surface italic">RECHARTS</span>
            </div>
          </div>
          <div className="grid md:grid-cols-3 gap-12">
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-black mb-6">1</div>
              <h4 className="text-xl font-bold text-on-surface mb-3">Install Tool</h4>
              <p className="text-on-surface-variant text-sm">Use our hosted web version instantly or clone locally.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-black mb-6">2</div>
              <h4 className="text-xl font-bold text-on-surface mb-3">Drag & Drop</h4>
              <p className="text-on-surface-variant text-sm">Simply slide your CSV or XML JTL files into the browser workspace.</p>
            </div>
            <div className="flex flex-col items-center text-center">
              <div className="w-10 h-10 rounded-full bg-primary-container text-on-primary-container flex items-center justify-center font-black mb-6">3</div>
              <h4 className="text-xl font-bold text-on-surface mb-3">Analyze</h4>
              <p className="text-on-surface-variant text-sm">Review 14+ metrics and automated insights to find bottlenecks.</p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  return (
    <div className="p-8 rounded-2xl bg-surface-container border border-outline-variant/10 hover:border-primary/40 transition-all duration-300 group">
      <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center mb-6 group-hover:bg-primary group-hover:text-on-primary transition-all">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 0, 'wght' 400, 'GRAD' 0, 'opsz' 24" }}>{icon}</span>
      </div>
      <h3 className="text-xl font-bold text-on-surface mb-3">{title}</h3>
      <p className="text-on-surface-variant leading-relaxed">{desc}</p>
    </div>
  );
}
