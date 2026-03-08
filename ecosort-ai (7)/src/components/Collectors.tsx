import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Truck, Phone, DollarSign, MapPin, Star, Recycle, CheckCircle2, Search, Filter, Map as MapIcon, List, X, Loader2, PhoneCall } from 'lucide-react';
import { clsx } from 'clsx';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';

// Fix Leaflet icon issue
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

interface Collector {
  id: string;
  name: string;
  type: 'General' | 'E-Waste' | 'Organic' | 'Metal';
  rating: number;
  distance: number; // in km
  minPickup: string;
  paysForWaste: boolean;
  phone: string;
  lat: number;
  lng: number;
}

const generateCollectors = (centerLat: number, centerLng: number): Collector[] => {
  return [
    {
      id: '1',
      name: 'EcoTech Recyclers',
      type: 'E-Waste',
      rating: 4.8,
      distance: 2.5,
      minPickup: '1 kg',
      paysForWaste: true,
      phone: '+1 234-567-8900',
      lat: centerLat + 0.01,
      lng: centerLng + 0.01
    },
    {
      id: '2',
      name: 'Green City Waste',
      type: 'General',
      rating: 4.5,
      distance: 1.2,
      minPickup: '5 kg',
      paysForWaste: false,
      phone: '+1 234-567-8901',
      lat: centerLat - 0.005,
      lng: centerLng - 0.005
    },
    {
      id: '3',
      name: 'Metal Masters',
      type: 'Metal',
      rating: 4.9,
      distance: 5.0,
      minPickup: '10 kg',
      paysForWaste: true,
      phone: '+1 234-567-8902',
      lat: centerLat + 0.02,
      lng: centerLng - 0.01
    },
    {
      id: '4',
      name: 'BioCompost Pro',
      type: 'Organic',
      rating: 4.6,
      distance: 3.8,
      minPickup: '2 kg',
      paysForWaste: false,
      phone: '+1 234-567-8903',
      lat: centerLat - 0.015,
      lng: centerLng + 0.02
    },
    {
      id: '5',
      name: 'Urban Scrappers',
      type: 'Metal',
      rating: 4.2,
      distance: 0.8,
      minPickup: '5 kg',
      paysForWaste: true,
      phone: '+1 234-567-8904',
      lat: centerLat + 0.002,
      lng: centerLng - 0.008
    }
  ];
};

interface RequestModalProps {
  collector: Collector | null;
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (details: any) => void;
}

function RequestModal({ collector, isOpen, onClose, onSubmit }: RequestModalProps) {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    itemType: 'General',
    quantity: '',
    notes: ''
  });

  if (!isOpen || !collector) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500));
    setLoading(false);
    onSubmit(formData);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="glass-panel rounded-2xl w-full max-w-md overflow-hidden border border-white/10"
      >
        <div className="p-6 border-b border-white/10 flex justify-between items-center bg-white/5">
          <div>
            <h3 className="text-lg font-bold text-white">Request Pickup</h3>
            <p className="text-sm text-slate-400">from <span className="text-emerald-400">{collector.name}</span></p>
          </div>
          <button onClick={onClose} className="p-2 hover:bg-white/10 rounded-full transition-colors">
            <X className="w-5 h-5 text-slate-400" />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Waste Type</label>
            <select 
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
              value={formData.itemType}
              onChange={e => setFormData({...formData, itemType: e.target.value})}
            >
              <option>General Waste</option>
              <option>E-Waste</option>
              <option>Metal Scrap</option>
              <option>Organic/Compost</option>
              <option>Plastic</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Estimated Quantity</label>
            <input 
              type="text" 
              placeholder="e.g., 5 kg or 3 bags"
              required
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all"
              value={formData.quantity}
              onChange={e => setFormData({...formData, quantity: e.target.value})}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-1">Notes (Optional)</label>
            <textarea 
              placeholder="Any specific instructions or details..."
              rows={3}
              className="w-full p-3 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:ring-2 focus:ring-emerald-500/50 focus:border-emerald-500 outline-none transition-all resize-none"
              value={formData.notes}
              onChange={e => setFormData({...formData, notes: e.target.value})}
            />
          </div>

          <div className="pt-2">
            <button 
              type="submit" 
              disabled={loading}
              className="w-full bg-emerald-600 text-white py-3.5 rounded-xl font-semibold hover:bg-emerald-500 active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed shadow-lg shadow-emerald-900/20"
            >
              {loading ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Sending Request...
                </>
              ) : (
                <>
                  <Truck className="w-5 h-5" />
                  Confirm Pickup Request
                </>
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

export function Collectors() {
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'distance' | 'rating'>('distance');
  const [requestSent, setRequestSent] = useState<string | null>(null);
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [collectors, setCollectors] = useState<Collector[]>([]);
  
  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCollector, setSelectedCollector] = useState<Collector | null>(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setUserLocation({ lat: latitude, lng: longitude });
          setCollectors(generateCollectors(latitude, longitude));
        },
        (error) => {
          console.error("Error getting location:", error);
          // Default location (e.g., San Francisco)
          const defaultLat = 37.7749;
          const defaultLng = -122.4194;
          setUserLocation({ lat: defaultLat, lng: defaultLng });
          setCollectors(generateCollectors(defaultLat, defaultLng));
        }
      );
    } else {
      // Fallback
      const defaultLat = 37.7749;
      const defaultLng = -122.4194;
      setUserLocation({ lat: defaultLat, lng: defaultLng });
      setCollectors(generateCollectors(defaultLat, defaultLng));
    }
  }, []);

  const filteredCollectors = collectors
    .filter(c => selectedType === 'All' || c.type === selectedType)
    .filter(c => c.name.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => {
      if (sortBy === 'distance') return a.distance - b.distance;
      if (sortBy === 'rating') return b.rating - a.rating;
      return 0;
    });

  const handleRequestClick = (collector: Collector) => {
    setSelectedCollector(collector);
    setIsModalOpen(true);
  };

  const handleRequestSubmit = (details: any) => {
    if (selectedCollector) {
      setRequestSent(selectedCollector.id);
      setTimeout(() => setRequestSent(null), 3000);
    }
  };

  const callNearest = () => {
    const nearest = [...collectors].sort((a, b) => a.distance - b.distance)[0];
    if (nearest) {
      window.location.href = `tel:${nearest.phone}`;
    }
  };

  return (
    <div className="space-y-4 md:space-y-6 h-[calc(100dvh-12rem)] md:h-[calc(100vh-8rem)] flex flex-col relative">
      <AnimatePresence>
        {isModalOpen && (
          <RequestModal 
            collector={selectedCollector}
            isOpen={isModalOpen}
            onClose={() => setIsModalOpen(false)}
            onSubmit={handleRequestSubmit}
          />
        )}
      </AnimatePresence>

      <div className="flex flex-col gap-4 glass-panel p-4 rounded-2xl border border-white/10">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-bold text-white tracking-tight">Waste Collectors</h2>
            <p className="text-slate-400 text-sm">Find certified collectors nearby</p>
          </div>
          
          <div className="flex items-center gap-3">
            <button 
              onClick={callNearest}
              className="hidden md:flex items-center gap-2 px-4 py-2 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium hover:bg-emerald-500/20 transition-all shadow-[0_0_15px_rgba(16,185,129,0.1)]"
            >
              <PhoneCall className="w-4 h-4" />
              Call Nearest
            </button>

            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
              <button
                onClick={() => setViewMode('list')}
                className={clsx(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'list' ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <List className="w-5 h-5" />
              </button>
              <button
                onClick={() => setViewMode('map')}
                className={clsx(
                  "p-2 rounded-lg transition-all",
                  viewMode === 'map' ? "bg-white/10 text-white shadow-sm" : "text-slate-500 hover:text-slate-300"
                )}
              >
                <MapIcon className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Call Nearest Button */}
        <button 
          onClick={callNearest}
          className="md:hidden w-full flex items-center justify-center gap-2 px-4 py-3 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-xl font-medium hover:bg-emerald-500/20 transition-all"
        >
          <PhoneCall className="w-4 h-4" />
          Call Nearest Collector
        </button>

        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search collectors..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 rounded-xl bg-black/40 border border-white/10 text-white placeholder:text-slate-600 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 transition-all"
            />
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 md:pb-0 no-scrollbar">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as 'distance' | 'rating')}
              className="px-4 py-2 rounded-xl border border-white/10 bg-black/40 text-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="distance">Nearest First</option>
              <option value="rating">Highest Rated</option>
            </select>

            {['All', 'E-Waste', 'Metal', 'Organic', 'General'].map(type => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={clsx(
                  "px-4 py-2 rounded-xl text-sm font-medium whitespace-nowrap transition-colors border",
                  selectedType === type 
                    ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" 
                    : "bg-white/5 text-slate-400 border-white/5 hover:bg-white/10"
                )}
              >
                {type}
              </button>
            ))}
          </div>
        </div>
      </div>

      {viewMode === 'list' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 overflow-y-auto pb-4 custom-scrollbar pr-2">
          {filteredCollectors.map((collector) => (
            <motion.div
              key={collector.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col justify-between group hover:border-emerald-500/30 transition-all"
            >
              <div>
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <span className={clsx(
                        "px-2 py-0.5 rounded-md text-[10px] font-bold uppercase tracking-wider border",
                        collector.type === 'E-Waste' ? "bg-purple-500/10 text-purple-400 border-purple-500/20" :
                        collector.type === 'Metal' ? "bg-amber-500/10 text-amber-400 border-amber-500/20" :
                        collector.type === 'Organic' ? "bg-green-500/10 text-green-400 border-green-500/20" :
                        "bg-slate-500/10 text-slate-400 border-slate-500/20"
                      )}>
                        {collector.type}
                      </span>
                      {collector.paysForWaste && (
                        <span className="flex items-center gap-1 text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-md border border-emerald-500/20">
                          <DollarSign className="w-3 h-3" /> CASH
                        </span>
                      )}
                    </div>
                    <h3 className="text-xl font-bold text-white">{collector.name}</h3>
                  </div>
                  <div className="flex items-center gap-1 bg-amber-500/10 px-2 py-1 rounded-lg border border-amber-500/20">
                    <Star className="w-3.5 h-3.5 text-amber-500 fill-amber-500" />
                    <span className="font-bold text-amber-500 text-sm">{collector.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-6">
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <MapPin className="w-4 h-4 text-slate-500" />
                    {collector.distance.toFixed(1)} km away
                  </div>
                  <div className="flex items-center gap-2 text-slate-400 text-sm">
                    <Recycle className="w-4 h-4 text-slate-500" />
                    Min: {collector.minPickup}
                  </div>
                </div>
              </div>

              <div className="flex gap-3 mt-auto">
                <a 
                  href={`tel:${collector.phone}`}
                  className="flex-1 px-4 py-2.5 rounded-xl border border-white/10 text-slate-300 font-medium hover:bg-white/5 flex items-center justify-center gap-2 transition-colors"
                >
                  <Phone className="w-4 h-4" />
                  Call
                </a>
                <button 
                  onClick={() => handleRequestClick(collector)}
                  disabled={requestSent === collector.id}
                  className={clsx(
                    "flex-1 px-4 py-2.5 rounded-xl font-medium flex items-center justify-center gap-2 transition-all",
                    requestSent === collector.id
                      ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                      : "bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-900/20"
                  )}
                >
                  {requestSent === collector.id ? (
                    <>
                      <CheckCircle2 className="w-4 h-4" />
                      Sent
                    </>
                  ) : (
                    <>
                      <Truck className="w-4 h-4" />
                      Request
                    </>
                  )}
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      ) : (
        <div className="flex-1 rounded-3xl overflow-hidden shadow-2xl border border-white/10 relative z-0">
          {userLocation && (
            <MapContainer 
              center={[userLocation.lat, userLocation.lng]} 
              zoom={13} 
              style={{ height: '100%', width: '100%', filter: 'invert(100%) hue-rotate(180deg) brightness(95%) contrast(90%)' }}
            >
              <TileLayer
                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
              />
              <Marker position={[userLocation.lat, userLocation.lng]}>
                <Popup>
                  <div className="text-slate-900">You are here</div>
                </Popup>
              </Marker>
              {filteredCollectors.map((collector) => (
                <Marker 
                  key={collector.id} 
                  position={[collector.lat, collector.lng]}
                >
                  <Popup>
                    <div className="p-2 min-w-[200px]">
                      <h3 className="font-bold text-slate-900">{collector.name}</h3>
                      <p className="text-sm text-slate-500 mb-2">{collector.type} • {collector.distance.toFixed(1)} km</p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleRequestClick(collector)}
                          className="flex-1 bg-emerald-600 text-white text-xs py-2 rounded-lg font-medium hover:bg-emerald-700 transition-colors"
                        >
                          {requestSent === collector.id ? 'Sent!' : 'Request'}
                        </button>
                        <a 
                          href={`tel:${collector.phone}`}
                          className="flex-1 bg-slate-100 text-slate-700 text-xs py-2 rounded-lg font-medium hover:bg-slate-200 transition-colors flex items-center justify-center gap-1"
                        >
                          <Phone className="w-3 h-3" /> Call
                        </a>
                      </div>
                    </div>
                  </Popup>
                </Marker>
              ))}
            </MapContainer>
          )}
        </div>
      )}
    </div>
  );
}
