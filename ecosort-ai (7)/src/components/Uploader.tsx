import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, X, Loader2, Image as ImageIcon, Layers, Scan } from 'lucide-react';
import { analyzeImage, WasteItem } from '../lib/gemini';
import { saveToHistory } from '../lib/storage';
import { WasteCard } from './WasteCard';
import { motion, AnimatePresence } from 'motion/react';
import { clsx } from 'clsx';

export function Uploader() {
  const [image, setImage] = useState<string | null>(null);
  const [results, setResults] = useState<WasteItem[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const file = acceptedFiles[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const base64 = reader.result as string;
      setImage(base64);
      handleAnalyze(base64);
    };
    reader.readAsDataURL(file);
  }, []);

  const handleAnalyze = async (base64: string) => {
    setLoading(true);
    setError(null);
    try {
      const data = await analyzeImage(base64);
      const items = Array.isArray(data) ? data : [data];
      setResults(items);
      
      // Save to history
      items.forEach(item => saveToHistory({ ...item, image: base64 }));
      
    } catch (err: any) {
      setError(err.message || "Failed to analyze image. Please try again.");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { 'image/*': [] },
    multiple: false
  } as any);

  const reset = () => {
    setImage(null);
    setResults([]);
    setError(null);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 max-w-6xl mx-auto h-[calc(100dvh-11rem)] lg:h-[calc(100vh-8rem)]">
      <div className="space-y-6 h-full flex flex-col">
        {!image ? (
          <div
            {...getRootProps()}
            className={clsx(
              "border border-dashed rounded-3xl p-12 text-center cursor-pointer transition-all h-full flex flex-col items-center justify-center gap-6 group relative overflow-hidden",
              isDragActive 
                ? "border-emerald-500 bg-emerald-500/10" 
                : "border-white/10 bg-white/5 hover:border-emerald-500/50 hover:bg-white/10"
            )}
          >
            <div className="absolute inset-0 bg-[linear-gradient(45deg,transparent_25%,rgba(255,255,255,0.02)_50%,transparent_75%,transparent_100%)] bg-[length:250%_250%] animate-[shimmer_3s_infinite]" />
            
            <input {...getInputProps()} />
            <div className="w-24 h-24 bg-emerald-500/10 rounded-full flex items-center justify-center mb-2 border border-emerald-500/20 group-hover:scale-110 transition-transform duration-500 shadow-[0_0_30px_rgba(16,185,129,0.1)]">
              <Upload className="w-10 h-10 text-emerald-400 group-hover:text-emerald-300 transition-colors" />
            </div>
            <div>
              <h3 className="text-2xl font-bold text-white mb-2 font-display tracking-tight">
                {isDragActive ? "Drop image here" : "Upload Image"}
              </h3>
              <p className="text-slate-400 max-w-xs mx-auto font-light">
                Drag & drop or click to upload waste photo for AI analysis
              </p>
            </div>
          </div>
        ) : (
          <div className="relative rounded-3xl overflow-hidden shadow-2xl shadow-emerald-900/20 group border border-white/10 h-full">
            <img src={image} alt="Uploaded waste" className="w-full h-full object-cover opacity-80" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            
            <button
              onClick={reset}
              className="absolute top-4 right-4 p-3 bg-black/50 backdrop-blur-md rounded-full border border-white/10 hover:bg-white/10 hover:border-white/30 transition-all group/btn"
            >
              <X className="w-5 h-5 text-slate-300 group-hover/btn:text-white" />
            </button>
            
            {loading && (
              <div className="absolute inset-0 bg-black/60 backdrop-blur-sm flex flex-col items-center justify-center gap-4">
                <div className="relative">
                  <div className="absolute inset-0 bg-emerald-500 blur-xl opacity-20 animate-pulse" />
                  <Loader2 className="w-16 h-16 text-emerald-400 animate-spin relative z-10" />
                </div>
                <p className="text-emerald-400 font-mono text-sm tracking-widest animate-pulse">ANALYZING_IMAGE...</p>
              </div>
            )}
            
            {results.length > 1 && (
              <div className="absolute bottom-6 right-6 bg-black/60 border border-white/10 text-emerald-400 px-4 py-2 rounded-lg text-xs font-mono backdrop-blur-md flex items-center gap-2">
                <Layers className="w-4 h-4" />
                {results.length} OBJECTS DETECTED
              </div>
            )}
          </div>
        )}

        {error && (
          <div className="p-4 bg-rose-500/10 text-rose-200 rounded-xl border border-rose-500/20 flex items-center gap-3 backdrop-blur-md">
            <X className="w-5 h-5 text-rose-500" />
            {error}
          </div>
        )}
      </div>

      <div className="space-y-6 overflow-y-auto custom-scrollbar pr-2 h-full">
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
              className="h-full flex flex-col items-center justify-center text-slate-500 border border-dashed border-white/10 rounded-3xl bg-white/5 p-8 text-center"
            >
              <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6 border border-white/5">
                <Scan className="w-8 h-8 text-slate-600" />
              </div>
              <p className="text-lg font-medium text-slate-300 font-display">Awaiting Input</p>
              <p className="text-sm mt-2 font-mono text-slate-500">Upload an image to initiate analysis protocol</p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
