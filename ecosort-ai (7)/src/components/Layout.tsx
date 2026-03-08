import React, { useState } from 'react';
import { Recycle, BarChart3, Camera, Upload, Truck, Bot, History as HistoryIcon, Settings } from 'lucide-react';
import { clsx } from 'clsx';
import { AnimatePresence, motion } from 'motion/react';
import { History } from './History'; // Import the History component (which includes settings)

interface LayoutProps {
  children: React.ReactNode;
  activeTab: 'scanner' | 'upload' | 'dashboard' | 'collectors' | 'chatbot' | 'history';
  onTabChange: (tab: 'scanner' | 'upload' | 'dashboard' | 'collectors' | 'chatbot' | 'history') => void;
}

export function Layout({ children, activeTab, onTabChange }: LayoutProps) {
  const navItems = [
    { id: 'scanner', label: 'Scanner', icon: Camera },
    { id: 'upload', label: 'Upload', icon: Upload },
    { id: 'collectors', label: 'Collectors', icon: Truck },
    { id: 'dashboard', label: 'Dashboard', icon: BarChart3 },
    { id: 'chatbot', label: 'Assistant', icon: Bot },
    { id: 'history', label: 'History', icon: HistoryIcon },
  ] as const;

  return (
    <div className="min-h-screen bg-[#050505] flex flex-col pb-20 md:pb-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-emerald-900/20 via-[#050505] to-[#050505]">
      {/* Desktop Header */}
      <header className="glass-panel sticky top-0 z-20 border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3 group cursor-pointer" onClick={() => onTabChange('dashboard')}>
            <div className="relative">
              <div className="absolute inset-0 bg-emerald-500 blur-lg opacity-40 group-hover:opacity-60 transition-opacity" />
              <div className="relative bg-black/50 p-2.5 rounded-xl border border-emerald-500/30 group-hover:border-emerald-500/60 transition-colors">
                <Recycle className="w-6 h-6 text-emerald-400" />
              </div>
            </div>
            <div>
              <h1 className="text-2xl font-bold text-white tracking-tight">EcoSort<span className="text-emerald-400">.AI</span></h1>
              <p className="text-[10px] text-emerald-500/80 font-mono tracking-widest uppercase">Intelligent Waste Analysis</p>
            </div>
          </div>
          
          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5 backdrop-blur-md">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => onTabChange(item.id)}
                className={clsx(
                  "px-5 py-2.5 rounded-xl text-sm font-medium transition-all flex items-center gap-2 relative overflow-hidden",
                  activeTab === item.id
                    ? "text-white shadow-lg shadow-emerald-900/20" 
                    : "text-slate-400 hover:text-white hover:bg-white/5"
                )}
              >
                {activeTab === item.id && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-500 opacity-100" />
                )}
                <div className="relative z-10 flex items-center gap-2">
                  <item.icon className={clsx("w-4 h-4", activeTab === item.id ? "text-white" : "text-current")} />
                  {item.label}
                </div>
              </button>
            ))}
          </nav>

          {/* Settings Button (Desktop) - Just links to History tab where settings live */}
          <button 
            onClick={() => onTabChange('history')}
            className="hidden md:flex p-2.5 rounded-xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Settings & History"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl mx-auto w-full p-4 md:p-8 relative z-10">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 glass-panel border-t border-white/10 px-6 py-4 z-30 pb-safe safe-area-pb overflow-x-auto no-scrollbar">
        <div className="flex justify-between items-center min-w-max gap-6 mx-auto">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => onTabChange(item.id)}
              className={clsx(
                "flex flex-col items-center gap-1.5 transition-all relative min-w-[60px]",
                activeTab === item.id
                  ? "text-emerald-400 scale-110" 
                  : "text-slate-500 hover:text-slate-300"
              )}
            >
              <div className={clsx(
                "p-2 rounded-xl transition-all",
                activeTab === item.id ? "bg-emerald-500/10 shadow-[0_0_15px_rgba(16,185,129,0.3)]" : "bg-transparent"
              )}>
                <item.icon className="w-5 h-5" />
              </div>
              <span className="text-[10px] font-medium tracking-wide">{item.label}</span>
              {activeTab === item.id && (
                <span className="absolute -bottom-2 w-1 h-1 bg-emerald-400 rounded-full shadow-[0_0_5px_#34d399]" />
              )}
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
}
