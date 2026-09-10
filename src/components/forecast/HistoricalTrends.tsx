'use client';

import React from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { useUnits } from '@/lib/context/UnitsContext';
import { formatTemperature, formatPrecipitation } from '@/lib/utils/formatters';
import { History, TrendingUp, TrendingDown, Award, Droplets } from 'lucide-react';

export function HistoricalTrends() {
  const { data } = useWeather();
  const { tempUnit, precipUnit } = useUnits();

  if (!data || !data.historical) return null;

  const h = data.historical;
  const isWarmer = h.tempDiff > 0;
  const isColder = h.tempDiff < 0;

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-orange-500/10 text-orange-400 border border-orange-500/20">
            <History className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Historical Climate Comparison</h3>
            <p className="text-xs text-slate-400">Comparing current telemetry to {h.baselinePeriod}</p>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Temperature Delta Card */}
        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Temperature Anomaly</span>
            {isWarmer ? (
              <TrendingUp className="w-4 h-4 text-rose-400" />
            ) : isColder ? (
              <TrendingDown className="w-4 h-4 text-sky-400" />
            ) : null}
          </div>

          <div className="flex items-baseline gap-2">
            <span className={`text-3xl font-black ${isWarmer ? 'text-rose-400' : isColder ? 'text-sky-400' : 'text-white'}`}>
              {h.tempDiff > 0 ? `+${h.tempDiff}` : h.tempDiff}°C
            </span>
            <span className="text-xs text-slate-400">vs Normal</span>
          </div>

          <p className="text-xs text-slate-300">
            Current: <strong>{formatTemperature(h.currentTemp, tempUnit)}</strong> · Normal:{' '}
            <strong>{formatTemperature(h.normalTemp, tempUnit)}</strong>
          </p>
        </div>

        {/* Precipitation Anomaly */}
        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Precipitation Delta</span>
            <Droplets className="w-4 h-4 text-cyan-400" />
          </div>

          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-cyan-400">
              {formatPrecipitation(h.currentPrecip, precipUnit)}
            </span>
            <span className="text-xs text-slate-400">vs {formatPrecipitation(h.normalPrecip, precipUnit)} avg</span>
          </div>

          <p className="text-xs text-slate-300">
            {h.precipDiff >= 0 ? `${h.precipDiff} mm above average` : `${Math.abs(h.precipDiff)} mm below average`}
          </p>
        </div>

        {/* Historical Records for Date */}
        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Date Climate Extremes</span>
            <Award className="w-4 h-4 text-amber-400" />
          </div>

          <div className="flex items-center justify-between text-xs pt-1">
            <div>
              <span className="text-[10px] text-slate-500 block">Record High</span>
              <strong className="text-rose-300 text-sm">{formatTemperature(h.recordHigh, tempUnit)}</strong>
            </div>
            <div>
              <span className="text-[10px] text-slate-500 block">Record Low</span>
              <strong className="text-sky-300 text-sm">{formatTemperature(h.recordLow, tempUnit)}</strong>
            </div>
          </div>

          <p className="text-[11px] text-slate-400 pt-0.5">Based on historical meteorological stations</p>
        </div>
      </div>

      <p className="text-xs text-slate-300 italic bg-white/5 p-3 rounded-xl border border-white/5">
        &quot;{h.trendSummary}&quot;
      </p>
    </div>
  );
}
