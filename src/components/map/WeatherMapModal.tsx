'use client';

import React from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import dynamic from 'next/dynamic';
import { X, Layers } from 'lucide-react';

// Dynamic import with SSR disabled for Leaflet
const DynamicWeatherMap = dynamic(() => import('./WeatherMap'), {
  ssr: false,
  loading: () => (
    <div className="w-full h-[600px] flex items-center justify-center bg-slate-900/80 rounded-2xl">
      <div className="flex flex-col items-center gap-3">
        <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Loading interactive satellite &amp; radar...</span>
      </div>
    </div>
  ),
});

export function WeatherMapModal() {
  const { activeMapModal, setActiveMapModal } = useWeather();

  if (!activeMapModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-6 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-6xl bg-slate-900 border border-white/15 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Modal Header */}
        <div className="px-6 py-4 border-b border-white/10 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-cyan-500/15 text-cyan-400 border border-cyan-500/30">
              <Layers className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">Full-Screen Meteorological Radar</h3>
              <p className="text-xs text-slate-400">Live multi-spectral weather tracking</p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setActiveMapModal(false)}
            className="p-2 rounded-xl bg-white/10 text-slate-300 hover:text-white hover:bg-white/15 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 flex-1 overflow-auto">
          <DynamicWeatherMap height="72vh" />
        </div>
      </div>
    </div>
  );
}
