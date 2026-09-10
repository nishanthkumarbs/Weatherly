'use client';

import React from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { useUnits } from '@/lib/context/UnitsContext';
import {
  formatTemperature,
  formatSpeed,
  formatPressure,
  getWindCompass,
  getUviRisk,
} from '@/lib/utils/formatters';
import {
  Droplets,
  Wind,
  Sun,
  Gauge,
  Eye,
  Cloud,
  Compass,
} from 'lucide-react';

export function ConditionsGrid() {
  const { data } = useWeather();
  const { tempUnit, speedUnit, pressureUnit } = useUnits();

  if (!data) return null;
  const c = data.current;
  const uviRisk = getUviRisk(c.uvi);

  // Compass rotation angle for needle
  const rotationDeg = c.wind_deg;

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
      
      {/* 1. Humidity & Dew Point */}
      <div className="glass-panel p-4 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>Humidity</span>
          <Droplets className="w-4 h-4 text-cyan-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">{c.humidity}%</div>
          <p className="text-[11px] text-slate-400 mt-1">
            Dew point {formatTemperature(c.dew_point, tempUnit)}
          </p>
        </div>
        {/* Progress bar */}
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-cyan-400 rounded-full"
            style={{ width: `${c.humidity}%` }}
          />
        </div>
      </div>

      {/* 2. Wind & Direction */}
      <div className="glass-panel p-4 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>Wind</span>
          <Wind className="w-4 h-4 text-teal-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">
            {formatSpeed(c.wind_speed, speedUnit)}
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-slate-300 mt-1">
            <Compass
              className="w-3.5 h-3.5 text-teal-400 transition-transform duration-500"
              style={{ transform: `rotate(${rotationDeg}deg)` }}
            />
            <span>
              {getWindCompass(c.wind_deg)} ({c.wind_deg}°)
            </span>
          </div>
        </div>
        {c.wind_gust && (
          <p className="text-[10px] text-slate-500 font-mono">
            Gusts: {formatSpeed(c.wind_gust, speedUnit)}
          </p>
        )}
      </div>

      {/* 3. UV Index */}
      <div className="glass-panel p-4 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>UV Index</span>
          <Sun className="w-4 h-4 text-amber-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white flex items-baseline gap-1.5">
            <span>{c.uvi}</span>
            <span
              className="text-xs font-bold px-1.5 py-0.5 rounded-full"
              style={{ backgroundColor: `${uviRisk.color}20`, color: uviRisk.color }}
            >
              {uviRisk.label}
            </span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {c.uvi >= 6 ? 'Wear SPF & hat' : 'Low risk exposure'}
          </p>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full"
            style={{
              width: `${Math.min(100, (c.uvi / 11) * 100)}%`,
              backgroundColor: uviRisk.color,
            }}
          />
        </div>
      </div>

      {/* 4. Pressure */}
      <div className="glass-panel p-4 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>Pressure</span>
          <Gauge className="w-4 h-4 text-purple-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">
            {formatPressure(c.pressure, pressureUnit)}
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {c.pressure >= 1013 ? 'High pressure (Steady)' : 'Low pressure system'}
          </p>
        </div>
        <div className="text-[10px] text-purple-300 font-mono">
          Standard: 1013 hPa
        </div>
      </div>

      {/* 5. Visibility */}
      <div className="glass-panel p-4 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>Visibility</span>
          <Eye className="w-4 h-4 text-blue-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">
            {(c.visibility / 1000).toFixed(1)} km
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            {c.visibility >= 10000 ? 'Clear horizon' : 'Haze or mist'}
          </p>
        </div>
        <div className="text-[10px] text-blue-300 font-mono">
          Max clear: 10+ km
        </div>
      </div>

      {/* 6. Cloud Cover */}
      <div className="glass-panel p-4 space-y-2 relative overflow-hidden">
        <div className="flex items-center justify-between text-slate-400 text-xs font-semibold">
          <span>Cloud Cover</span>
          <Cloud className="w-4 h-4 text-sky-400" />
        </div>
        <div>
          <div className="text-2xl font-black text-white">{c.clouds}%</div>
          <p className="text-[11px] text-slate-400 mt-1 capitalize">
            {c.condition}
          </p>
        </div>
        <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-sky-400 rounded-full"
            style={{ width: `${c.clouds}%` }}
          />
        </div>
      </div>

    </div>
  );
}
