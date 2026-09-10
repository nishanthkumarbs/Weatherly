'use client';

import React, { useMemo } from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { useTheme } from '@/lib/context/ThemeContext';

export function WeatherBackground() {
  const { data } = useWeather();
  const { theme, dynamicBg } = useTheme();

  const isDay = useMemo(() => {
    if (!data) return true;
    const now = data.current.timestamp;
    return now >= data.current.sunrise && now < data.current.sunset;
  }, [data]);

  const condition = data?.current?.condition?.toLowerCase() || 'clear';
  const isRain = condition.includes('rain') || condition.includes('drizzle') || condition.includes('thunderstorm');
  const isStorm = condition.includes('thunderstorm');
  const isSnow = condition.includes('snow');
  const isCloudy = condition.includes('cloud') || condition.includes('overcast');

  // Background gradient configuration
  const gradientClass = useMemo(() => {
    if (!dynamicBg) {
      return theme === 'light'
        ? 'from-sky-50 via-slate-100 to-indigo-50'
        : 'from-slate-950 via-slate-900 to-zinc-950';
    }

    if (isStorm) {
      return 'from-slate-950 via-purple-950 to-zinc-900';
    }
    if (isRain) {
      return isDay
        ? 'from-slate-800 via-sky-900 to-blue-950'
        : 'from-slate-950 via-blue-950 to-neutral-950';
    }
    if (isSnow) {
      return isDay
        ? 'from-blue-200 via-slate-300 to-indigo-200 text-slate-800'
        : 'from-slate-900 via-blue-950 to-slate-950';
    }
    if (isCloudy) {
      return isDay
        ? (theme === 'light' ? 'from-sky-200 via-slate-200 to-indigo-100' : 'from-slate-900 via-slate-850 to-sky-950')
        : 'from-slate-950 via-slate-900 to-zinc-950';
    }
    // Clear
    if (isDay) {
      return theme === 'light'
        ? 'from-sky-400 via-cyan-300 to-blue-400'
        : 'from-sky-900 via-slate-900 to-indigo-950';
    } else {
      return 'from-slate-950 via-indigo-950 to-black';
    }
  }, [dynamicBg, theme, isStorm, isRain, isSnow, isCloudy, isDay]);

  // Procedural raindrops
  const raindrops = useMemo(() => {
    if (!isRain || !dynamicBg) return [];
    return Array.from({ length: 45 }, (_, i) => ({
      id: i,
      left: `${(i * 2.2 + 1) % 100}%`,
      delay: `${((i * 0.17) % 1.5).toFixed(2)}s`,
      duration: `${(0.65 + ((i * 0.05) % 0.5)).toFixed(2)}s`,
      opacity: (0.3 + (i % 5) * 0.12).toFixed(2),
    }));
  }, [isRain, dynamicBg]);

  return (
    <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden transition-colors duration-1000">
      {/* Primary Gradient Layer */}
      <div className={`absolute inset-0 bg-gradient-to-br ${gradientClass} transition-all duration-1000`} />

      {/* Atmospheric Glow Spheres */}
      {dynamicBg && (
        <>
          <div
            className={`absolute -top-32 -left-32 w-[600px] h-[600px] rounded-full blur-[120px] pointer-events-none ambient-glow ${
              isDay
                ? isRain
                  ? 'bg-sky-500/20'
                  : 'bg-amber-400/25'
                : 'bg-indigo-600/20'
            }`}
          />
          <div
            className={`absolute top-1/3 -right-32 w-[550px] h-[550px] rounded-full blur-[140px] pointer-events-none ambient-glow ${
              isStorm
                ? 'bg-purple-600/25'
                : isRain
                ? 'bg-blue-600/20'
                : 'bg-cyan-500/15'
            }`}
            style={{ animationDelay: '-4s' }}
          />
        </>
      )}

      {/* Rain Drops Layer */}
      {isRain && dynamicBg && (
        <div className="absolute inset-0 overflow-hidden">
          {raindrops.map((drop) => (
            <div
              key={drop.id}
              className="rain-drop"
              style={{
                left: drop.left,
                animationDelay: drop.delay,
                animationDuration: drop.duration,
                opacity: drop.opacity,
              }}
            />
          ))}
        </div>
      )}

      {/* Subtle Noise / Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,transparent_0%,rgba(0,0,0,0.4)_100%)] opacity-70" />
    </div>
  );
}
