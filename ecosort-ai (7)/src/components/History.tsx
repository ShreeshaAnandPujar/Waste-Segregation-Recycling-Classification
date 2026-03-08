import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Trash2, Clock, CheckCircle2, XCircle, ChevronRight, AlertTriangle, Key, Loader2, Save, RefreshCw, Edit2, Image as ImageIcon } from 'lucide-react';
import { getHistory, clearHistory, saveApiKey, getStoredApiKey, removeApiKey, updateHistoryItem } from '../lib/storage';
import { validateApiKey, WasteItem, WasteCategory } from '../lib/gemini';
import { clsx } from 'clsx';

const CATEGORIES: WasteCategory[] = ['Plastic', 'Paper', 'Glass', 'Metal', 'Organic', 'Cardboard', 'E-Waste', 'Trash'];

export function History() {
  const [history, setHistory] = useState<WasteItem[]>([]);
  const [apiKey, setApiKey] = useState('');
  const [isValidating, setIsValidating] = useState(false);
  const [validationStatus, setValidationStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [showSettings, setShowSettings] = useState(false);
  const [editingItem, setEditingItem] = useState<string | null>(null);
  const [newCategory, setNewCategory] = useState<WasteCategory | ''>('');

  useEffect(() => {
    setHistory(getHistory());
    const storedKey = getStoredApiKey();
    if (storedKey) {
      setApiKey(storedKey);
      setValidationStatus('success');
    }
  }, []);

  const handleClearHistory = () => {
    if (window.confirm("Are you sure you want to clear your scan history?")) {
      clearHistory();
      setHistory([]);
    }
  };

  const handleSaveApiKey = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!apiKey.trim()) return;

    setIsValidating(true);
    setValidationStatus('idle');

    const isValid = await validateApiKey(apiKey);
    
    if (isValid) {
      saveApiKey(apiKey);
      setValidationStatus('success');
      setTimeout(() => setShowSettings(false), 1500);
    } else {
      setValidationStatus('error');
    }
    setIsValidating(false);
  };

  const handleRemoveApiKey = () => {
    if (window.confirm("Remove custom API key? The app will revert to the default key (if available).")) {
      removeApiKey();
      setApiKey('');
      setValidationStatus('idle');
    }
  };

  const startEditing = (item: WasteItem) => {
    setEditingItem(item.id || null);
    setNewCategory(item.category);
  };

  const saveCorrection = (id: string) => {
    if (!newCategory) return;
    
    const updatedHistory = updateHistoryItem(id, { category: newCategory as WasteCategory });
    setHistory(updatedHistory);
    setEditingItem(null);
    setNewCategory('');
    
    // In a real app, you would send this feedback to a server to improve the model
    console.log(`User corrected item ${id} to category ${newCategory}`);
  };

  return (
    <div className="h-[calc(100dvh-12rem)] md:h-[calc(100vh-8rem)] flex flex-col gap-6">
      {/* Settings Toggle / Status */}
      <div className="glass-panel p-4 rounded-xl border border-white/10 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={clsx(
            "p-2 rounded-lg border",
            validationStatus === 'success' ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400" :
            validationStatus === 'error' ? "bg-red-500/10 border-red-500/20 text-red-400" :
            "bg-white/5 border-white/10 text-slate-400"
          )}>
            <Key className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-sm font-medium text-white">Gemini API Key</h3>
            <p className="text-xs text-slate-400">
              {validationStatus === 'success' ? 'Custom key active' : 'Using default key'}
            </p>
          </div>
        </div>
        <button 
          onClick={() => setShowSettings(!showSettings)}
          className="text-xs bg-white/5 hover:bg-white/10 text-slate-300 px-3 py-1.5 rounded-lg border border-white/5 transition-colors"
        >
          {showSettings ? 'Close' : 'Manage'}
        </button>
      </div>

      <AnimatePresence>
        {showSettings && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden"
          >
            <form onSubmit={handleSaveApiKey} className="glass-panel p-6 rounded-xl border border-white/10 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-300 mb-2">Enter Custom API Key</label>
                <input 
                  type="password" 
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="AIzaSy..."
                  className="w-full bg-black/40 border border-white/10 rounded-xl p-3 text-white placeholder:text-slate-600 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                />
              </div>
              
              {validationStatus === 'error' && (
                <div className="flex items-center gap-2 text-red-400 text-xs bg-red-500/10 p-3 rounded-lg border border-red-500/20">
                  <AlertTriangle className="w-4 h-4" />
                  Invalid API Key. Please check and try again.
                </div>
              )}

              {validationStatus === 'success' && (
                <div className="flex items-center gap-2 text-emerald-400 text-xs bg-emerald-500/10 p-3 rounded-lg border border-emerald-500/20">
                  <CheckCircle2 className="w-4 h-4" />
                  API Key verified and saved!
                </div>
              )}

              <div className="flex gap-3">
                <button 
                  type="submit" 
                  disabled={isValidating || !apiKey.trim()}
                  className="flex-1 bg-emerald-600 text-white py-2.5 rounded-xl font-medium hover:bg-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2"
                >
                  {isValidating ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  Validate & Save
                </button>
                {validationStatus === 'success' && (
                  <button 
                    type="button"
                    onClick={handleRemoveApiKey}
                    className="px-4 py-2.5 bg-red-500/10 text-red-400 border border-red-500/20 rounded-xl hover:bg-red-500/20 transition-colors"
                  >
                    Remove
                  </button>
                )}
              </div>
            </form>
          </motion.div>
        )}
      </AnimatePresence>

      {/* History List */}
      <div className="flex-1 glass-panel rounded-2xl border border-white/10 flex flex-col overflow-hidden">
        <div className="p-4 border-b border-white/10 bg-white/5 flex justify-between items-center">
          <h2 className="font-bold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-emerald-400" />
            Scan History
          </h2>
          {history.length > 0 && (
            <button 
              onClick={handleClearHistory}
              className="text-xs text-red-400 hover:text-red-300 flex items-center gap-1 px-2 py-1 rounded hover:bg-red-500/10 transition-colors"
            >
              <Trash2 className="w-3 h-3" /> Clear
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-3 custom-scrollbar">
          {history.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-4">
              <div className="w-16 h-16 rounded-full bg-white/5 flex items-center justify-center border border-white/10">
                <Clock className="w-8 h-8 opacity-50" />
              </div>
              <p>No scan history yet</p>
            </div>
          ) : (
            history.map((item, index) => (
              <motion.div
                key={item.id || index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="bg-white/5 border border-white/10 rounded-xl p-4 hover:border-emerald-500/30 transition-colors group"
              >
                <div className="flex gap-4">
                  {/* Thumbnail */}
                  <div className="w-20 h-20 rounded-lg bg-black/40 border border-white/10 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt={item.item} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-600">
                        <ImageIcon className="w-8 h-8" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <h3 className="font-bold text-white truncate">{item.item}</h3>
                        <p className="text-xs text-slate-400 font-mono flex items-center gap-2">
                          <span>{new Date(item.timestamp || Date.now()).toLocaleDateString()}</span>
                          <span className="w-1 h-1 rounded-full bg-slate-600" />
                          <span>{new Date(item.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </p>
                      </div>
                      
                      {editingItem === item.id ? (
                        <div className="flex items-center gap-2">
                          <select
                            value={newCategory}
                            onChange={(e) => setNewCategory(e.target.value as WasteCategory)}
                            className="bg-black/40 border border-white/20 text-white text-xs rounded px-2 py-1 focus:outline-none focus:border-emerald-500"
                          >
                            {CATEGORIES.map(cat => (
                              <option key={cat} value={cat}>{cat}</option>
                            ))}
                          </select>
                          <button 
                            onClick={() => saveCorrection(item.id!)}
                            className="p-1 bg-emerald-500/20 text-emerald-400 rounded hover:bg-emerald-500/30"
                          >
                            <CheckCircle2 className="w-4 h-4" />
                          </button>
                          <button 
                            onClick={() => setEditingItem(null)}
                            className="p-1 bg-white/5 text-slate-400 rounded hover:bg-white/10"
                          >
                            <XCircle className="w-4 h-4" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-end gap-1">
                          <span className={clsx(
                            "px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider border cursor-pointer hover:opacity-80 transition-opacity",
                            item.recyclable 
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                              : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                          )} onClick={() => startEditing(item)} title="Click to correct">
                            {item.category}
                          </span>
                          <span className="text-[10px] text-slate-500 font-mono">
                            {Math.round(item.confidence * 100)}% CONFIDENCE
                          </span>
                        </div>
                      )}
                    </div>
                    
                    <div className="text-sm text-slate-300 bg-black/20 p-3 rounded-lg border border-white/5 mt-2">
                      <p className="font-medium text-emerald-400 text-xs mb-1 uppercase tracking-wide">Disposal Guide</p>
                      {item.disposal_tips}
                    </div>

                    {!editingItem && (
                      <button 
                        onClick={() => startEditing(item)}
                        className="mt-2 text-[10px] text-slate-500 hover:text-emerald-400 flex items-center gap-1 transition-colors"
                      >
                        <Edit2 className="w-3 h-3" />
                        Incorrect classification?
                      </button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
