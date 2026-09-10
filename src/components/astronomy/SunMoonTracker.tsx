'use client';

import React from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { getMoonPhaseName } from '@/lib/utils/formatters';
import { Sun, Moon, Sunrise, Sunset } from 'lucide-react';

export function SunMoonTracker() {
  const { data } = useWeather();
  if (!data) return null;

  const current = data.current;
  const todayDaily = data.daily[0];
  const now = current.timestamp;
  const sunrise = current.sunrise;
  const sunset = current.sunset;
  const moonPhase = todayDaily?.moon_phase ?? 0.5;

  const sunriseStr = new Date(sunrise * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  const sunsetStr = new Date(sunset * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Calculate daylight percentage
  const totalDaylight = sunset - sunrise;
  const elapsedDaylight = Math.max(0, Math.min(totalDaylight, now - sunrise));
  const daylightProgress = totalDaylight > 0 ? (elapsedDaylight / totalDaylight) * 100 : 50;
  const isDay = now >= sunrise && now < sunset;

  // Moon phase calculation
  const moonName = getMoonPhaseName(moonPhase);
  const moonIllumination = Math.round((1 - Math.abs(moonPhase - 0.5) * 2) * 100);

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <Sun className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Sun &amp; Moon Astronomy</h3>
            <p className="text-xs text-slate-400">Daylight trajectory &amp; lunar cycle</p>
          </div>
        </div>

        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-white/10 text-slate-300">
          {isDay ? 'Daytime' : 'Nighttime'}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Sun Trajectory Arc */}
        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-4">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
              <Sunrise className="w-4 h-4" /> Sunrise {sunriseStr}
            </span>
            <span className="flex items-center gap-1.5 text-orange-400 font-semibold">
              <Sunset className="w-4 h-4" /> Sunset {sunsetStr}
            </span>
          </div>

          {/* SVG Sun Arc */}
          <div className="relative w-full h-24 flex items-end justify-center overflow-hidden">
            <svg viewBox="0 0 200 100" className="w-full h-full stroke-slate-800">
              {/* Arc background */}
              <path
                d="M 20 90 A 80 80 0 0 1 180 90"
                fill="none"
                strokeWidth="4"
                strokeDasharray="4 4"
                className="stroke-white/20"
              />
              {/* Progress Arc */}
              {isDay && (
                <path
                  d="M 20 90 A 80 80 0 0 1 180 90"
                  fill="none"
                  strokeWidth="4"
                  stroke="#fbbf24"
                  strokeDasharray="251"
                  strokeDashoffset={251 - (251 * (daylightProgress / 100))}
                />
              )}
            </svg>

            {/* Sun position indicator */}
            {isDay && (
              <div
                className="absolute w-5 h-5 rounded-full bg-amber-400 shadow-lg shadow-amber-400/80 -translate-x-1/2 -translate-y-1/2 transition-all duration-700"
                style={{
                  left: `${20 + (daylightProgress * 0.6)}%`,
                  top: `${Math.max(10, 85 - Math.sin((daylightProgress / 100) * Math.PI) * 70)}%`,
                }}
              />
            )}
          </div>

          <div className="text-center text-xs text-slate-400">
            {isDay ? (
              <span>
                Daylight remaining: <strong className="text-white">{Math.round((sunset - now) / 3600)} hrs {Math.round(((sunset - now) % 3600) / 60)} mins</strong>
              </span>
            ) : (
              <span>Sun is currently below the local horizon</span>
            )}
          </div>
        </div>

        {/* Moon Phase Details */}
        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 flex items-center justify-between gap-4">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-indigo-300 font-semibold text-xs">
              <Moon className="w-4 h-4" />
              <span>Lunar Phase</span>
            </div>
            <h4 className="text-lg font-bold text-white">{moonName}</h4>
            <p className="text-xs text-slate-400">
              Illumination: <strong className="text-white">{moonIllumination}%</strong>
            </p>
            <div className="h-1.5 w-32 bg-slate-800 rounded-full overflow-hidden mt-2">
              <div
                className="h-full bg-indigo-400 rounded-full"
                style={{ width: `${moonIllumination}%` }}
              />
            </div>
          </div>

          {/* Moon Visual Sphere */}
          <div className="relative w-20 h-20 rounded-full bg-slate-900 border-2 border-slate-700 flex items-center justify-center shadow-inner overflow-hidden flex-shrink-0">
            {/* Crater details */}
            <div className="absolute w-3 h-3 rounded-full bg-slate-800/80 top-3 left-4" />
            <div className="absolute w-4 h-4 rounded-full bg-slate-800/60 bottom-4 right-3" />
            <div className="absolute w-2 h-2 rounded-full bg-slate-800/80 bottom-3 left-6" />

            {/* Illuminated crescent / disc */}
            <div
              className="absolute inset-0 rounded-full bg-gradient-to-tr from-amber-100 to-indigo-100 opacity-90 transition-all duration-500"
              style={{
                clipPath: moonPhase <= 0.5
                  ? `ellipse(${Math.max(10, moonIllumination)}% 100% at ${50 + (0.5 - moonPhase) * 100}% 50%)`
                  : `ellipse(${Math.max(10, moonIllumination)}% 100% at ${50 - (moonPhase - 0.5) * 100}% 50%)`,
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
