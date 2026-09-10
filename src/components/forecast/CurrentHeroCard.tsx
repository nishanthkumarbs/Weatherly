'use client';

import React, { useState, useEffect } from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { useUnits } from '@/lib/context/UnitsContext';
import { formatTemperature, formatSpeed, getWindCompass } from '@/lib/utils/formatters';
import { WeatherIcon } from '@/lib/utils/weather-icons';
import { MapPin, ArrowUp, ArrowDown, Droplets, Wind, Gauge, Compass } from 'lucide-react';

interface NormalComparison {
  tenYearAvg: number;
  diff: number;
  comparisonText: string;
}

export function CurrentHeroCard() {
  const { data } = useWeather();
  const { tempUnit, speedUnit } = useUnits();
  const [normalComparison, setNormalComparison] = useState<NormalComparison | null>(null);

  useEffect(() => {
    if (!data) return;
    fetch(`/api/historical-normal?lat=${data.location.lat}&lon=${data.location.lon}&currentTemp=${data.current.temp}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && json.comparisonText) setNormalComparison(json);
      })
      .catch(() => {});
  }, [data?.location.lat, data?.location.lon, data?.current.temp]);

  if (!data) return null;

  const current = data.current;
  const isDay = current.timestamp >= current.sunrise && current.timestamp < current.sunset;
  const formattedDate = new Date(current.timestamp * 1000).toLocaleDateString([], {
    weekday: 'long',
    month: 'short',
    day: 'numeric',
  });
  const formattedTime = new Date(current.timestamp * 1000).toLocaleTimeString([], {
    hour: 'numeric',
    minute: '2-digit',
  });

  return (
    <div className="glass-panel p-6 sm:p-8 relative overflow-hidden group">
      {/* Background radial accent */}
      <div className="absolute -right-16 -top-16 w-72 h-72 rounded-full bg-cyan-500/10 blur-3xl pointer-events-none group-hover:bg-cyan-500/15 transition-all duration-700" />

      <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
        
        {/* Left: Location, Time & Big Temp */}
        <div className="space-y-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-cyan-400 font-semibold text-sm">
              <MapPin className="w-4 h-4" />
              <span>{data.location.name}</span>
              {data.location.country && (
                <span className="text-slate-400 font-normal">({data.location.country})</span>
              )}
            </div>
            <p className="text-xs text-slate-400 font-medium">
              {formattedDate} • Updated at {formattedTime}
            </p>
          </div>

          <div className="flex items-baseline gap-4">
            <h1 className="text-6xl sm:text-7xl lg:text-8xl font-black tracking-tighter text-white drop-shadow-md">
              {formatTemperature(current.temp, tempUnit)}
            </h1>

            <div className="space-y-1">
              <div className="flex items-center gap-2 text-xs font-semibold text-slate-300">
                <span className="flex items-center text-rose-400">
                  <ArrowUp className="w-3.5 h-3.5" />
                  {formatTemperature(current.temp_max, tempUnit)}
                </span>
                <span className="text-slate-500">/</span>
                <span className="flex items-center text-sky-400">
                  <ArrowDown className="w-3.5 h-3.5" />
                  {formatTemperature(current.temp_min, tempUnit)}
                </span>
              </div>
              <p className="text-xs text-slate-300 font-medium">
                Feels like <strong className="text-white">{formatTemperature(current.feels_like, tempUnit)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 text-xs font-bold capitalize">
              {current.description}
            </span>
            {normalComparison && (
              <span
                className={`px-3 py-1 rounded-full border text-xs font-semibold flex items-center gap-1.5 ${
                  normalComparison.diff > 0
                    ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
                    : normalComparison.diff < 0
                    ? 'bg-sky-500/20 text-sky-300 border-sky-500/30'
                    : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
                }`}
                title={`10-Year historical average for this date: ${normalComparison.tenYearAvg}°C`}
              >
                <span>{normalComparison.comparisonText}</span>
              </span>
            )}
            <span className="text-xs text-slate-400">
              Dew point: {formatTemperature(current.dew_point, tempUnit)}
            </span>
          </div>
        </div>

        {/* Right: Weather Hero Icon & Key Quick Metrics */}
        <div className="flex flex-col sm:flex-row items-center md:items-end gap-6">
          <div className="flex flex-col items-center justify-center p-4 rounded-2xl bg-white/5 border border-white/10 backdrop-blur-sm shadow-inner">
            <WeatherIcon
              code={current.icon}
              condition={current.condition}
              isDay={isDay}
              className="w-20 h-20 sm:w-24 sm:h-24 drop-shadow-2xl"
            />
            <span className="text-sm font-bold text-white mt-1 capitalize">{current.condition}</span>
          </div>

          {/* Quick Metrics Capsule */}
          <div className="grid grid-cols-2 gap-3 w-full sm:w-auto">
            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Droplets className="w-3.5 h-3.5 text-cyan-400" />
                <span>Humidity</span>
              </div>
              <p className="text-sm font-bold text-white">{current.humidity}%</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Wind className="w-3.5 h-3.5 text-teal-400" />
                <span>Wind</span>
              </div>
              <p className="text-sm font-bold text-white flex items-center gap-1">
                <span>{formatSpeed(current.wind_speed, speedUnit)}</span>
                <span className="text-[11px] text-teal-300 font-mono">
                  {getWindCompass(current.wind_deg)}
                </span>
              </p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Gauge className="w-3.5 h-3.5 text-purple-400" />
                <span>Pressure</span>
              </div>
              <p className="text-sm font-bold text-white">{current.pressure} hPa</p>
            </div>

            <div className="p-3 rounded-xl bg-white/5 border border-white/5 space-y-0.5">
              <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                <Compass className="w-3.5 h-3.5 text-amber-400" />
                <span>UV Index</span>
              </div>
              <p className="text-sm font-bold text-white">{current.uvi} / 11</p>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}
