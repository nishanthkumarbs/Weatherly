'use client';

import React from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import {
  Sparkles,
  Footprints,
  Bike,
  Utensils,
  Umbrella,
  SunMedium,
  CheckCircle,
  AlertCircle,
} from 'lucide-react';

export function ActivityRecommendations() {
  const { data } = useWeather();
  if (!data) return null;

  const activities = data.activities;
  const current = data.current;
  const hourly = data.hourly;

  const isRainSoon = hourly.slice(0, 6).some((h) => h.pop > 0.4);
  const needUmbrella = current.condition.toLowerCase().includes('rain') || isRainSoon;
  const needSunscreen = current.uvi >= 5;
  const needWarmCoat = current.temp < 8;

  const getIcon = (name: string) => {
    switch (name) {
      case 'Footprints':
        return <Footprints className="w-5 h-5 text-cyan-400" />;
      case 'Bike':
        return <Bike className="w-5 h-5 text-teal-400" />;
      case 'Utensils':
        return <Utensils className="w-5 h-5 text-amber-400" />;
      default:
        return <Sparkles className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Sparkles className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Outdoor Activity &amp; Gear Advisor</h3>
            <p className="text-xs text-slate-400">Condition-based smart recommendations</p>
          </div>
        </div>
      </div>

      {/* Quick Gear Advisories */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
            needUmbrella
              ? 'bg-sky-500/15 border-sky-500/30 text-sky-200'
              : 'bg-white/5 border-white/5 text-slate-400'
          }`}
        >
          <Umbrella className="w-4 h-4 flex-shrink-0 text-sky-400" />
          <span>{needUmbrella ? 'Bring an umbrella today' : 'No umbrella needed'}</span>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
            needSunscreen
              ? 'bg-amber-500/15 border-amber-500/30 text-amber-200'
              : 'bg-white/5 border-white/5 text-slate-400'
          }`}
        >
          <SunMedium className="w-4 h-4 flex-shrink-0 text-amber-400" />
          <span>{needSunscreen ? 'Sunscreen advised (UV 5+)' : 'Low UV exposure'}</span>
        </div>

        <div
          className={`p-3 rounded-xl border flex items-center gap-2.5 text-xs font-medium ${
            needWarmCoat
              ? 'bg-blue-500/15 border-blue-500/30 text-blue-200'
              : 'bg-white/5 border-white/5 text-slate-400'
          }`}
        >
          <CheckCircle className="w-4 h-4 flex-shrink-0 text-teal-400" />
          <span>{needWarmCoat ? 'Heavy coat or layers required' : 'Comfortable outerwear'}</span>
        </div>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-1">
        {activities.map((act) => (
          <div
            key={act.id}
            className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-3 hover:border-white/10 transition-colors"
          >
            <div className="flex items-center justify-between">
              <div className="p-2 rounded-xl bg-white/5">{getIcon(act.iconName)}</div>
              <span
                className="text-xs font-bold px-2 py-0.5 rounded-full"
                style={{ backgroundColor: `${act.badgeColor}20`, color: act.badgeColor }}
              >
                {act.level} ({act.score}%)
              </span>
            </div>

            <div>
              <h4 className="font-bold text-sm text-white">{act.name}</h4>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed line-clamp-2">
                {act.summary}
              </p>
            </div>

            <div className="h-1.5 w-full bg-slate-800 rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${act.score}%`, backgroundColor: act.badgeColor }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
