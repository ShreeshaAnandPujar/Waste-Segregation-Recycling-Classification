import React, { useRef, useState, useCallback, useEffect } from 'react';
import Webcam from 'react-webcam';
import { Camera, RefreshCw, Loader2, AlertCircle, Layers, Scan, Zap, Maximize2 } from 'lucide-react';
import { analyzeImage, WasteItem } from '../lib/gemini';
import { saveToHistory } from '../lib/storage';
import { WasteCard } from './WasteCard';
import { motion, AnimatePresence } from 'motion/react';

const videoConstraints = {
  width: 1280,
  height: 720,
  facingMode: "environment"
};

const THROTTLE_DELAY = 2000; // 2 seconds between auto-scans

export function Scanner() {
  const webcamRef = useRef<Webcam>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const lastScanTime = useRef<number>(0);
  
  const [isScanning, setIsScanning] = useState(false);
  const [results, setResults] = useState<WasteItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [autoScan, setAutoScan] = useState(false);

  const capture = useCallback(async () => {
    if (!webcamRef.current) return;
    
    // Throttle check for auto-scan
    const now = Date.now();
    if (autoScan && now - lastScanTime.current < THROTTLE_DELAY) return;
    
    const imageSrc = webcamRef.current.getScreenshot();
    if (!imageSrc) return;

    lastScanTime.current = now;
    setIsScanning(true);
    setError(null);
    
    try {
      const data = await analyzeImage(imageSrc);
      // Ensure data is an array (though analyzeImage returns single item now, we might want to support multi in future)
      const items = Array.isArray(data) ? data : [data];
      setResults(items);
      
      // Save to history
      items.forEach(item => saveToHistory({ ...item, image: imageSrc }));
      
      drawBBoxes(items);
    } catch (err: any) {
      setError(err.message || "Failed to analyze image");
      console.error(err);
      // Don't clear results on error to avoid flickering, but maybe dim them?
    } finally {
      setIsScanning(false);
    }
  }, [webcamRef, autoScan]);

  const drawBBoxes = (items: WasteItem[]) => {
    const canvas = canvasRef.current;
    const video = webcamRef.current?.video;
    if (!canvas || !video) return;

    const { videoWidth, videoHeight } = video;
    canvas.width = videoWidth;
    canvas.height = videoHeight;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    items.forEach(item => {
      if (!item.bbox) return;
      
      // bbox is [ymin, xmin, ymax, xmax] normalized
      const [ymin, xmin, ymax, xmax] = item.bbox;
      
      const x = xmin * videoWidth;
      const y = ymin * videoHeight;
      const w = (xmax - xmin) * videoWidth;
      const h = (ymax - ymin) * videoHeight;

      // Color based on category
      const color = item.recyclable ? '#10b981' : '#f43f5e';

      // Draw futuristic corners instead of full box
      const cornerSize = 20;
      ctx.strokeStyle = color;
      ctx.lineWidth = 3;
      
      // Top Left
      ctx.beginPath(); ctx.moveTo(x, y + cornerSize); ctx.lineTo(x, y); ctx.lineTo(x + cornerSize, y); ctx.stroke();
      // Top Right
      ctx.beginPath(); ctx.moveTo(x + w - cornerSize, y); ctx.lineTo(x + w, y); ctx.lineTo(x + w, y + cornerSize); ctx.stroke();
      // Bottom Left
      ctx.beginPath(); ctx.moveTo(x, y + h - cornerSize); ctx.lineTo(x, y + h); ctx.lineTo(x + cornerSize, y + h); ctx.stroke();
      // Bottom Right
      ctx.beginPath(); ctx.moveTo(x + w - cornerSize, y + h); ctx.lineTo(x + w, y + h); ctx.lineTo(x + w, y + h - cornerSize); ctx.stroke();
      
      // Semi-transparent fill
      ctx.fillStyle = color + '10'; // Very subtle fill
      ctx.fillRect(x, y, w, h);

      // Label background with tech look
      ctx.fillStyle = color;
      const label = `${item.item} [${Math.round(item.confidence * 100)}%]`;
      const textWidth = ctx.measureText(label).width;
      
      // Label tag
      ctx.beginPath();
      ctx.moveTo(x, y - 24);
      ctx.lineTo(x + textWidth + 20, y - 24);
      ctx.lineTo(x + textWidth + 30, y);
      ctx.lineTo(x, y);
      ctx.fill();

      // Label text
      ctx.fillStyle = '#000000';
      ctx.font = 'bold 14px "JetBrains Mono", monospace';
      ctx.fillText(label, x + 8, y - 7);
    });
  };

  // Auto-scan effect
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (autoScan) {
      interval = setInterval(() => {
        if (!isScanning) capture();
      }, 500); // Check frequently, but capture respects throttle
    }
    return () => clearInterval(interval);
  }, [autoScan, isScanning, capture]);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[calc(100dvh-11rem)] lg:h-[calc(100vh-8rem)]">
      <div className="lg:col-span-2 relative bg-black rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/20 w-full h-full flex items-center justify-center group border border-white/10">
        <Webcam
          audio={false}
          ref={webcamRef}
          screenshotFormat="image/jpeg"
          videoConstraints={videoConstraints}
          className="w-full h-full object-cover opacity-80"
          mirrored={false}
          imageSmoothing={true}
          forceScreenshotSourceSize={false}
          disablePictureInPicture={false}
          screenshotQuality={0.92}
          onUserMedia={() => {}}
          onUserMediaError={() => {}}
        />
        <canvas 
          ref={canvasRef} 
          className="absolute top-0 left-0 w-full h-full pointer-events-none z-10" 
        />
        
        {/* HUD Overlay */}
        <div className="absolute inset-0 pointer-events-none z-10">
          {/* Grid Lines */}
          <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px]"></div>
          
          {/* Corner Brackets */}
          <div className="absolute top-6 left-6 w-16 h-16 border-t-2 border-l-2 border-emerald-500/50 rounded-tl-lg"></div>
          <div className="absolute top-6 right-6 w-16 h-16 border-t-2 border-r-2 border-emerald-500/50 rounded-tr-lg"></div>
          <div className="absolute bottom-6 left-6 w-16 h-16 border-b-2 border-l-2 border-emerald-500/50 rounded-bl-lg"></div>
          <div className="absolute bottom-6 right-6 w-16 h-16 border-b-2 border-r-2 border-emerald-500/50 rounded-br-lg"></div>
          
          {/* Center Focus */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border border-emerald-500/20 rounded-lg">
            <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 w-1 h-2 bg-emerald-500/50"></div>
            <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 w-1 h-2 bg-emerald-500/50"></div>
            <div className="absolute left-0 top-1/2 -translate-x-1/2 -translate-y-1/2 w-2 h-1 bg-emerald-500/50"></div>
            <div className="absolute right-0 top-1/2 translate-x-1/2 -translate-y-1/2 w-2 h-1 bg-emerald-500/50"></div>
          </div>

          {/* Scanning Animation */}
          {isScanning && (
            <div className="absolute top-0 left-0 w-full h-1 bg-emerald-400/80 shadow-[0_0_20px_rgba(52,211,153,0.8)] animate-scan z-20"></div>
          )}

          {/* Status Text */}
          <div className="absolute top-8 left-10 flex flex-col gap-1">
            <div className="flex items-center gap-2">
              <div className={`w-2 h-2 rounded-full ${isScanning ? 'bg-emerald-400 animate-pulse' : 'bg-emerald-900'}`}></div>
              <span className="text-xs font-mono text-emerald-500/80 tracking-widest">SYSTEM_ACTIVE</span>
            </div>
            <div className="text-[10px] font-mono text-emerald-500/50">V.2.4.0_BETA</div>
          </div>
        </div>

        {/* Controls Overlay */}
        <div className="absolute bottom-0 left-0 right-0 p-8 bg-gradient-to-t from-black via-black/80 to-transparent z-20 flex items-center justify-center gap-8">
          <button
            onClick={() => setAutoScan(!autoScan)}
            className={`px-6 py-3 rounded-xl font-mono text-xs tracking-wider backdrop-blur-md transition-all flex items-center gap-2 border ${
              autoScan 
                ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-[0_0_15px_rgba(16,185,129,0.2)]' 
                : 'bg-white/5 text-slate-400 border-white/10 hover:bg-white/10'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${autoScan ? 'animate-spin' : ''}`} />
            {autoScan ? 'AUTO_SCAN: ON' : 'AUTO_SCAN: OFF'}
          </button>
          
          <button
            onClick={capture}
            disabled={isScanning || autoScan}
            className="w-20 h-20 rounded-full bg-white/5 border border-white/10 text-white flex items-center justify-center shadow-2xl hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative group"
          >
            <div className="absolute inset-0 rounded-full border border-emerald-500/30 scale-110 group-hover:scale-125 transition-transform duration-500"></div>
            <div className="absolute inset-0 rounded-full border border-emerald-500/10 scale-125 group-hover:scale-150 transition-transform duration-700"></div>
            {isScanning ? (
              <Loader2 className="w-8 h-8 animate-spin text-emerald-400" />
            ) : (
              <div className="relative">
                <Scan className="w-8 h-8 text-emerald-400" />
                <div className="absolute inset-0 bg-emerald-400 blur-md opacity-40"></div>
              </div>
            )}
          </button>
          
          <div className="w-[140px] hidden md:block"></div> {/* Spacer for balance */}
        </div>

        {error && (
          <div className="absolute top-24 left-1/2 -translate-x-1/2 bg-rose-500/10 border border-rose-500/20 text-rose-200 px-6 py-3 rounded-xl flex items-center gap-3 backdrop-blur-md animate-in fade-in slide-in-from-top-4 z-30 max-w-md text-center">
            <AlertCircle className="w-5 h-5 flex-shrink-0 text-rose-500" />
            <span className="text-sm font-medium">{error}</span>
          </div>
        )}
        
        {/* Multi-item indicator */}
        {results.length > 1 && (
          <div className="absolute top-8 right-8 bg-black/60 border border-white/10 text-emerald-400 px-4 py-2 rounded-lg text-xs font-mono backdrop-blur-md flex items-center gap-2">
            <Layers className="w-4 h-4" />
            {results.length} OBJECTS DETECTED
          </div>
        )}
      </div>

      <div className="lg:col-span-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar">
        <AnimatePresence mode="popLayout">
          {results.length > 0 ? (
            results.map((item, index) => (
              <motion.div 
                key={`${item.item}-${index}`}
                initial={{ opacity: 0, x: 20 }} 
                animate={{ opacity: 1, x: 0 }} 
                exit={{ opacity: 0, scale: 0.9 }}
                transition={{ delay: index * 0.1 }}
              >
                <WasteCard item={item} />
              </motion.div>
            ))
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="h-full flex flex-col items-center justify-center text-slate-500 p-8 text-center border border-dashed border-white/10 rounded-3xl bg-white/5 min-h-[300px]"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <Maximize2 className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-lg font-medium text-slate-300 font-display">System Ready</p>
              <p className="text-sm mt-2 font-mono text-slate-500">Align waste item in reticle for analysis</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
