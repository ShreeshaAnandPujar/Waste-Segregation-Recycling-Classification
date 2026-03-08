import React, { useState, useEffect } from 'react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area, Cell } from 'recharts';
import { motion } from 'motion/react';
import { Activity, Zap, HardDrive, Clock, Trophy, TrendingUp, Gift, Crown, ArrowRight, Truck, Recycle, Leaf, Droplets, Terminal, Cpu, Wifi, Lightbulb } from 'lucide-react';
import { clsx } from 'clsx';
import { getFastEcoTip } from '../lib/gemini';

const data = [
  { name: 'Plastic', value: 400 },
  { name: 'Paper', value: 300 },
  { name: 'Glass', value: 300 },
  { name: 'Metal', value: 200 },
  { name: 'Organic', value: 278 },
  { name: 'E-Waste', value: 189 },
];

const trendData = [
  { name: 'Mon', value: 20 },
  { name: 'Tue', value: 45 },
  { name: 'Wed', value: 35 },
  { name: 'Thu', value: 80 },
  { name: 'Fri', value: 55 },
  { name: 'Sat', value: 90 },
  { name: 'Sun', value: 70 },
];

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899'];

const topItems = [
  { name: 'Plastic Bottle', count: 145, trend: '+12%' },
  { name: 'Soda Can', count: 98, trend: '+5%' },
  { name: 'Cardboard Box', count: 76, trend: '-2%' },
  { name: 'Glass Jar', count: 45, trend: '+8%' },
];

const rewards = [
  { id: 1, title: '10% Off EcoStore', cost: 500, icon: Gift, color: 'bg-purple-500/20 text-purple-400 border-purple-500/30' },
  { id: 2, title: 'Free Pickup', cost: 300, icon: Truck, color: 'bg-blue-500/20 text-blue-400 border-blue-500/30' },
  { id: 3, title: 'Premium Badge', cost: 1000, icon: Crown, color: 'bg-amber-500/20 text-amber-400 border-amber-500/30' },
];

const activityLog = [
  { time: '10:42 AM', action: 'Scanned Plastic Bottle', points: '+5' },
  { time: '09:15 AM', action: 'Recycled Cardboard', points: '+10' },
  { time: 'Yesterday', action: 'Weekly Goal Achieved', points: '+50' },
  { time: 'Yesterday', action: 'Scanned Aluminum Can', points: '+5' },
];

export function Dashboard() {
  const [score, setScore] = useState(850);
  const [systemStatus, setSystemStatus] = useState('ONLINE');
  const [ecoTip, setEcoTip] = useState<string>('Loading daily tip...');

  useEffect(() => {
    const interval = setInterval(() => {
      setSystemStatus(prev => prev === 'ONLINE' ? 'SYNCING...' : 'ONLINE');
    }, 5000);

    // Fetch Eco Tip
    getFastEcoTip().then(setEcoTip);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-8">
      {/* Live System Status Bar */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-panel p-3 rounded-xl border border-emerald-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs font-mono text-emerald-400">SYSTEM_STATUS</span>
          </div>
          <span className="text-xs font-mono text-white tracking-widest">{systemStatus}</span>
        </div>
        <div className="glass-panel p-3 rounded-xl border border-blue-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Wifi className="w-3 h-3 text-blue-400" />
            <span className="text-xs font-mono text-blue-400">NETWORK</span>
          </div>
          <span className="text-xs font-mono text-white tracking-widest">5G_CONNECTED</span>
        </div>
        <div className="glass-panel p-3 rounded-xl border border-purple-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Cpu className="w-3 h-3 text-purple-400" />
            <span className="text-xs font-mono text-purple-400">AI_CORE</span>
          </div>
          <span className="text-xs font-mono text-white tracking-widest">ACTIVE</span>
        </div>
        <div className="glass-panel p-3 rounded-xl border border-amber-500/20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-3 h-3 text-amber-400" />
            <span className="text-xs font-mono text-amber-400">ENERGY</span>
          </div>
          <span className="text-xs font-mono text-white tracking-widest">OPTIMAL</span>
        </div>
      </div>

      {/* Eco Score Banner */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-3xl border border-emerald-500/30 bg-gradient-to-r from-emerald-900/40 to-black/40 backdrop-blur-xl p-8 shadow-2xl shadow-emerald-900/20 group"
      >
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-y-1/2 translate-x-1/3 blur-3xl animate-pulse-glow" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full translate-y-1/3 -translate-x-1/4 blur-3xl" />
        <div className="absolute inset-0 bg-[linear-gradient(rgba(16,185,129,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(16,185,129,0.03)_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
        
        <div className="flex flex-col md:flex-row items-center justify-between gap-8 relative z-10">
          <div className="flex items-center gap-8">
            <div className="relative group-hover:scale-105 transition-transform duration-500">
              <div className="absolute inset-0 bg-emerald-400 blur-xl opacity-20 animate-pulse" />
              <div className="relative bg-gradient-to-br from-emerald-500/20 to-emerald-900/20 p-6 rounded-2xl border border-emerald-500/30 backdrop-blur-md shadow-[0_0_30px_rgba(16,185,129,0.2)]">
                <Trophy className="w-12 h-12 text-emerald-400 drop-shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
              </div>
            </div>
            <div>
              <h2 className="text-4xl font-bold text-white mb-2 tracking-tight font-display">Eco Credit Score</h2>
              <p className="text-emerald-200/70 text-lg font-light">Excellent! You're in the top <span className="text-emerald-400 font-bold font-mono">5%</span> of recyclers.</p>
            </div>
          </div>
          <div className="text-center md:text-right">
            <div className="text-7xl font-bold mb-2 tracking-tighter text-transparent bg-clip-text bg-gradient-to-b from-white to-emerald-200 drop-shadow-[0_0_15px_rgba(16,185,129,0.3)] font-mono">
              {score}
            </div>
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-sm font-medium shadow-[0_0_10px_rgba(16,185,129,0.1)]">
              <TrendingUp className="w-4 h-4" />
              +24 points this week
            </div>
          </div>
        </div>
      </motion.div>

      {/* Fast Eco Tip */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-panel p-4 rounded-xl border border-amber-500/20 bg-amber-500/5 flex items-center gap-4"
      >
        <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20 shrink-0">
          <Lightbulb className="w-5 h-5 text-amber-400" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-1">Daily Eco Insight</h4>
          <p className="text-sm text-slate-300 italic">"{ecoTip}"</p>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Rewards Section */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-panel rounded-3xl p-6 lg:col-span-1 flex flex-col border border-white/10"
        >
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2 font-display">
              <Gift className="w-5 h-5 text-purple-400" />
              Available Rewards
            </h3>
            <button className="text-emerald-400 text-xs font-medium hover:text-emerald-300 tracking-wider uppercase font-mono border-b border-emerald-500/30 hover:border-emerald-400 transition-all">View All</button>
          </div>
          <div className="space-y-4 flex-1">
            {rewards.map((reward) => (
              <div key={reward.id} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:border-emerald-500/30 transition-all group cursor-pointer hover:bg-white/10 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000" />
                <div className="flex items-center gap-4 relative z-10">
                  <div className={clsx("p-3 rounded-lg border backdrop-blur-sm shadow-lg", reward.color)}>
                    <reward.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-200 group-hover:text-white transition-colors">{reward.title}</p>
                    <p className="text-xs text-slate-500 font-mono mt-0.5">{reward.cost} PTS</p>
                  </div>
                </div>
                <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center text-slate-400 group-hover:bg-emerald-500 group-hover:text-white group-hover:border-emerald-500 transition-all relative z-10">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Stats Grid */}
        <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-white/10"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Recycle className="w-24 h-24 text-emerald-500" />
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider font-mono">Total Recycled</h3>
              <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20 shadow-[0_0_10px_rgba(16,185,129,0.1)]">
                <Recycle className="w-4 h-4 text-emerald-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight relative z-10 font-mono">1,284 <span className="text-lg text-slate-500 font-normal font-sans">kg</span></p>
            <p className="text-xs text-emerald-400 mt-2 flex items-center relative z-10 font-mono">
              <Activity className="w-3 h-3 mr-1" /> +12% vs last month
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-panel p-6 rounded-2xl relative overflow-hidden group border border-white/10"
          >
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Leaf className="w-24 h-24 text-blue-500" />
            </div>
            <div className="flex items-center justify-between mb-4 relative z-10">
              <h3 className="text-sm font-medium text-slate-400 uppercase tracking-wider font-mono">Carbon Saved</h3>
              <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20 shadow-[0_0_10px_rgba(59,130,246,0.1)]">
                <Leaf className="w-4 h-4 text-blue-400" />
              </div>
            </div>
            <p className="text-3xl font-bold text-white tracking-tight relative z-10 font-mono">450 <span className="text-lg text-slate-500 font-normal font-sans">kg</span></p>
            <p className="text-xs text-emerald-400 mt-2 flex items-center relative z-10 font-mono">
              <TrendingUp className="w-3 h-3 mr-1" /> Equivalent to 20 trees
            </p>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="glass-panel p-6 rounded-2xl col-span-1 sm:col-span-2 border border-white/10"
          >
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white font-display">Weekly Analytics</h3>
              <div className="flex gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]"></span>
                <span className="text-xs text-slate-400 font-mono">Recycled Items</span>
              </div>
            </div>
            <div className="h-48 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={trendData}>
                  <defs>
                    <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.05)" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'monospace' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 12, fontFamily: 'monospace' }} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: 'rgba(0,0,0,0.8)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)', backdropFilter: 'blur(10px)' }}
                    itemStyle={{ color: '#fff', fontFamily: 'monospace' }}
                    cursor={{ stroke: 'rgba(16,185,129,0.5)', strokeWidth: 1, strokeDasharray: '5 5' }}
                  />
                  <Area type="monotone" dataKey="value" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorValue)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </motion.div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="glass-panel p-6 rounded-3xl lg:col-span-2 border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-6 font-display">Frequently Detected Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {topItems.map((item, index) => (
              <div key={index} className="flex items-center justify-between p-4 bg-white/5 rounded-xl border border-white/5 hover:bg-white/10 transition-colors group">
                <div className="flex items-center gap-4">
                  <div className="w-10 h-10 bg-gradient-to-br from-slate-800 to-slate-900 rounded-lg flex items-center justify-center font-bold text-slate-400 shadow-inner border border-white/5 font-mono group-hover:text-emerald-400 group-hover:border-emerald-500/30 transition-colors">
                    0{index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-slate-200">{item.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="h-1.5 w-24 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.5)]" style={{ width: `${(item.count / 200) * 100}%` }}></div>
                      </div>
                      <p className="text-xs text-slate-500 font-mono">{item.count}</p>
                    </div>
                  </div>
                </div>
                <div className={clsx(
                  "text-xs font-medium px-2.5 py-1 rounded-full border font-mono",
                  item.trend.startsWith('+') 
                    ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" 
                    : "bg-rose-500/10 text-rose-400 border-rose-500/20"
                )}>
                  {item.trend}
                </div>
              </div>
            ))}
          </div>
        </motion.div>

        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="glass-panel p-6 rounded-3xl border border-white/10"
        >
          <h3 className="text-lg font-semibold text-white mb-6 font-display">Composition Analysis</h3>
          <div className="h-64 w-full relative">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data} layout="vertical" margin={{ left: 0, right: 30 }}>
                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="rgba(255,255,255,0.05)" />
                <XAxis type="number" hide />
                <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontFamily: 'monospace' }} width={70} />
                <Tooltip 
                  cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                  contentStyle={{ backgroundColor: '#000', border: '1px solid #333', borderRadius: '8px', color: '#fff', fontFamily: 'monospace' }}
                />
                <Bar dataKey="value" radius={[0, 4, 4, 0]} barSize={16}>
                  {data.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      {/* Recent Activity Log */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="glass-panel p-6 rounded-3xl border border-white/10"
      >
        <div className="flex items-center gap-3 mb-6">
          <Terminal className="w-5 h-5 text-slate-400" />
          <h3 className="text-lg font-semibold text-white font-display">System Log</h3>
        </div>
        <div className="space-y-2 font-mono text-sm">
          {activityLog.map((log, index) => (
            <div key={index} className="flex items-center justify-between p-3 bg-black/40 rounded-lg border border-white/5 hover:border-emerald-500/20 transition-colors group">
              <div className="flex items-center gap-4">
                <span className="text-slate-500 text-xs">[{log.time}]</span>
                <span className="text-slate-300 group-hover:text-emerald-400 transition-colors">
                  <span className="text-emerald-500/50 mr-2">{'>'}</span>
                  {log.action}
                </span>
              </div>
              <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 text-xs">
                {log.points} PTS
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
