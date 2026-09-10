'use client';

import React from 'react';
import dynamic from 'next/dynamic';

const DynamicWeatherMap = dynamic(() => import('./WeatherMap'), {
  ssr: false,
  loading: () => (
    <div className="glass-panel p-6 space-y-4">
      <div className="h-6 w-48 bg-white/10 rounded-lg animate-pulse" />
      <div className="h-96 w-full bg-slate-900/60 rounded-2xl flex flex-col items-center justify-center gap-3 border border-white/5">
        <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
        <span className="text-xs text-slate-400">Loading radar tile layers...</span>
      </div>
    </div>
  ),
});

export function MapWidgetWrapper() {
  return <DynamicWeatherMap height="420px" />;
}
