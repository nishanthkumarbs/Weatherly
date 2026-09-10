'use client';

import React, { useState } from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { useUnits } from '@/lib/context/UnitsContext';
import { formatTemperature, formatWeekday, formatSpeed } from '@/lib/utils/formatters';
import { WeatherIcon } from '@/lib/utils/weather-icons';
import { Calendar, ChevronDown, ChevronUp, Sun, Moon, Wind, Droplets } from 'lucide-react';

export function DailyForecastList() {
  const { data } = useWeather();
  const { tempUnit, speedUnit } = useUnits();
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  if (!data || !data.daily || data.daily.length === 0) return null;

  const daily = data.daily;

  // Calculate global min and max for temperature bar scales
  const allMins = daily.map((d) => d.temp_min);
  const allMaxs = daily.map((d) => d.temp_max);
  const globalMin = Math.min(...allMins);
  const globalMax = Math.max(...allMaxs);
  const tempRange = Math.max(globalMax - globalMin, 1);

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">7-Day Extended Forecast</h3>
            <p className="text-xs text-slate-400">Daily outlook, min/max ranges &amp; conditions</p>
          </div>
        </div>
      </div>

      <div className="divide-y divide-white/5">
        {daily.map((day, idx) => {
          const isExpanded = expandedIndex === idx;
          const leftPercent = Math.max(0, ((day.temp_min - globalMin) / tempRange) * 100);
          const barWidth = Math.max(10, ((day.temp_max - day.temp_min) / tempRange) * 100);

          return (
            <div key={day.dt} className="py-3 first:pt-0 last:pb-0">
              <div
                onClick={() => setExpandedIndex(isExpanded ? null : idx)}
                className="flex items-center justify-between gap-3 p-2 rounded-xl hover:bg-white/5 cursor-pointer transition-colors"
              >
                {/* Day name & icon */}
                <div className="flex items-center gap-3 w-32 sm:w-40 flex-shrink-0">
                  <WeatherIcon code={day.icon} condition={day.condition} className="w-6 h-6" />
                  <div>
                    <span className="font-bold text-sm text-white block">
                      {idx === 0 ? 'Today' : formatWeekday(day.dt)}
                    </span>
                    <span className="text-[11px] text-slate-400 block capitalize truncate max-w-[100px]">
                      {day.condition}
                    </span>
                  </div>
                </div>

                {/* Rain probability badge */}
                <div className="w-16 flex-shrink-0 text-center">
                  {day.pop > 0.15 ? (
                    <span className="text-[11px] font-bold text-sky-400 bg-sky-500/10 border border-sky-500/20 px-2 py-0.5 rounded-full inline-flex items-center gap-1">
                      <Droplets className="w-3 h-3" />
                      {Math.round(day.pop * 100)}%
                    </span>
                  ) : (
                    <span className="text-[11px] text-slate-500">—</span>
                  )}
                </div>

                {/* Temperature Range Bar */}
                <div className="flex-1 flex items-center gap-2 max-w-xs sm:max-w-md">
                  <span className="text-xs text-slate-400 font-mono w-10 text-right">
                    {formatTemperature(day.temp_min, tempUnit)}
                  </span>

                  <div className="flex-1 h-2 bg-slate-800 rounded-full relative overflow-hidden">
                    <div
                      className="absolute top-0 bottom-0 rounded-full bg-gradient-to-r from-sky-400 via-amber-300 to-rose-400"
                      style={{
                        left: `${leftPercent}%`,
                        width: `${barWidth}%`,
                      }}
                    />
                  </div>

                  <span className="text-xs font-bold text-white font-mono w-10 text-left">
                    {formatTemperature(day.temp_max, tempUnit)}
                  </span>
                </div>

                {/* Expand Indicator */}
                <div className="p-1 text-slate-400">
                  {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </div>
              </div>

              {/* Collapsible Deep Daily Details */}
              {isExpanded && (
                <div className="mt-2 p-4 rounded-xl bg-black/40 border border-white/5 text-xs text-slate-300 space-y-3">
                  <p className="text-slate-200 font-medium leading-relaxed italic">
                    &quot;{day.summary}&quot;
                  </p>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 border-t border-white/10">
                    <div className="p-2 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 block">Morning</span>
                      <strong className="text-white text-sm">{formatTemperature(day.temp_morn, tempUnit)}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 block">Afternoon</span>
                      <strong className="text-white text-sm">{formatTemperature(day.temp_day, tempUnit)}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 block">Evening</span>
                      <strong className="text-white text-sm">{formatTemperature(day.temp_eve, tempUnit)}</strong>
                    </div>
                    <div className="p-2 rounded-lg bg-white/5">
                      <span className="text-[10px] text-slate-400 block">Overnight</span>
                      <strong className="text-white text-sm">{formatTemperature(day.temp_night, tempUnit)}</strong>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                    <span className="flex items-center gap-1.5">
                      <Wind className="w-3.5 h-3.5 text-teal-400" />
                      Wind: {formatSpeed(day.wind_speed, speedUnit)}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Sun className="w-3.5 h-3.5 text-amber-400" />
                      UV Index: {day.uvi}
                    </span>
                    <span className="flex items-center gap-1.5">
                      <Moon className="w-3.5 h-3.5 text-indigo-300" />
                      Humidity: {day.humidity}%
                    </span>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
