'use client';

import React from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { Activity, ShieldCheck, AlertTriangle } from 'lucide-react';

export function AirQualityWidget() {
  const { data } = useWeather();
  if (!data || !data.airQuality) return null;

  const aqi = data.airQuality;

  // Percentage on 0-300 scale for visual gauge
  const gaugePercent = Math.min(100, Math.max(5, (aqi.aqi / 300) * 100));

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <Activity className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Air Quality Index (AQI)</h3>
            <p className="text-xs text-slate-400">US EPA Standard particulate tracking</p>
          </div>
        </div>

        <div
          className="px-3 py-1 rounded-full text-xs font-bold border"
          style={{
            backgroundColor: `${aqi.color}20`,
            borderColor: `${aqi.color}40`,
            color: aqi.color,
          }}
        >
          {aqi.category}
        </div>
      </div>

      {/* Main Gauge & Value */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 rounded-2xl bg-black/30 border border-white/5">
        <div className="space-y-1">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-black text-white">{aqi.aqi}</span>
            <span className="text-xs text-slate-400 uppercase font-bold tracking-wider">US EPA AQI</span>
          </div>
          <p className="text-xs text-slate-300 leading-relaxed max-w-sm">
            {aqi.healthAdvice}
          </p>
        </div>

        {/* Multi-segment AQI Spectrum Bar */}
        <div className="w-full sm:w-56 space-y-1.5">
          <div className="h-3 w-full rounded-full bg-slate-800 relative overflow-hidden flex">
            <div className="h-full w-[20%] bg-emerald-500" />
            <div className="h-full w-[20%] bg-yellow-400" />
            <div className="h-full w-[20%] bg-orange-500" />
            <div className="h-full w-[20%] bg-rose-500" />
            <div className="h-full w-[20%] bg-purple-600" />
          </div>
          {/* Needle indicator */}
          <div className="relative h-2 w-full">
            <div
              className="absolute -top-1.5 w-3 h-3 bg-white border-2 border-slate-900 rounded-full shadow-lg transition-all duration-700"
              style={{ left: `calc(${gaugePercent}% - 6px)` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
            <span>0 Good</span>
            <span>100</span>
            <span>300+ Haz</span>
          </div>
        </div>
      </div>

      {/* Pollutant Breakdown Grid */}
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1">
        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 font-medium block">PM2.5</span>
          <strong className="text-xs font-bold text-white block mt-0.5">{aqi.pm25}</strong>
          <span className="text-[9px] text-slate-500">µg/m³</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 font-medium block">PM10</span>
          <strong className="text-xs font-bold text-white block mt-0.5">{aqi.pm10}</strong>
          <span className="text-[9px] text-slate-500">µg/m³</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 font-medium block">Ozone (O₃)</span>
          <strong className="text-xs font-bold text-white block mt-0.5">{aqi.o3}</strong>
          <span className="text-[9px] text-slate-500">ppb</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 font-medium block">NO₂</span>
          <strong className="text-xs font-bold text-white block mt-0.5">{aqi.no2}</strong>
          <span className="text-[9px] text-slate-500">µg/m³</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 font-medium block">CO</span>
          <strong className="text-xs font-bold text-white block mt-0.5">{aqi.co}</strong>
          <span className="text-[9px] text-slate-500">mg/m³</span>
        </div>

        <div className="p-2.5 rounded-xl bg-white/5 border border-white/5 text-center">
          <span className="text-[10px] text-slate-400 font-medium block">SO₂</span>
          <strong className="text-xs font-bold text-white block mt-0.5">{aqi.so2}</strong>
          <span className="text-[9px] text-slate-500">µg/m³</span>
        </div>
      </div>
    </div>
  );
}
