import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle2, AlertTriangle, Clock, Leaf, Recycle, XCircle } from 'lucide-react';
import { WasteItem } from '../lib/gemini';
import { clsx } from 'clsx';

interface WasteCardProps {
  item: WasteItem;
  className?: string;
}

export function WasteCard({ item, className }: WasteCardProps) {
  const isRecyclable = item.recyclable;
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={clsx("glass-panel rounded-2xl overflow-hidden group hover:border-emerald-500/30 transition-all duration-300", className)}
    >
      <div className={clsx(
        "h-1 w-full shadow-[0_0_10px_currentColor]",
        isRecyclable ? "bg-emerald-500 text-emerald-500" : "bg-rose-500 text-rose-500"
      )} />
      
      <div className="p-6 space-y-6">
        <div className="flex items-start justify-between">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className={clsx(
                "px-2.5 py-1 rounded-md text-[10px] font-bold uppercase tracking-widest border",
                isRecyclable 
                  ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]" 
                  : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-[0_0_10px_rgba(244,63,94,0.1)]"
              )}>
                {item.category}
              </span>
              <span className="text-[10px] text-emerald-500/50 font-mono tracking-wider">
                {(item.confidence * 100).toFixed(0)}% MATCH
              </span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{item.item}</h2>
          </div>
          
          <div className={clsx(
            "p-3 rounded-xl border backdrop-blur-md shadow-lg",
            isRecyclable 
              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20 shadow-emerald-900/20" 
              : "bg-rose-500/10 text-rose-400 border-rose-500/20 shadow-rose-900/20"
          )}>
            {isRecyclable ? <Recycle className="w-6 h-6" /> : <XCircle className="w-6 h-6" />}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-slate-400 font-medium text-xs uppercase tracking-wider">
              <Clock className="w-3.5 h-3.5 text-amber-500" />
              Decomposition
            </div>
            <p className="text-slate-200 text-sm font-mono">{item.decomposition_time}</p>
          </div>

          <div className="bg-white/5 p-4 rounded-xl space-y-2 border border-white/5 hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-2 text-slate-400 font-medium text-xs uppercase tracking-wider">
              <Leaf className="w-3.5 h-3.5 text-emerald-500" />
              Eco Alternative
            </div>
            <p className="text-slate-200 text-sm font-mono">{item.eco_alternative || "None available"}</p>
          </div>
        </div>

        <div className="space-y-3">
          <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-widest">Disposal Protocol</h3>
          <div className="flex gap-4 bg-blue-500/5 p-4 rounded-xl border border-blue-500/10 hover:border-blue-500/30 transition-colors">
            <CheckCircle2 className="w-5 h-5 text-blue-400 flex-shrink-0 mt-0.5" />
            <p className="text-blue-100/80 text-sm leading-relaxed font-light">
              {item.disposal_tips}
            </p>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
