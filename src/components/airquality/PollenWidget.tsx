'use client';

import React from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { Flower2, Trees, Wheat, Sprout, Info } from 'lucide-react';

export function PollenWidget() {
  const { data } = useWeather();
  if (!data || !data.pollen) return null;

  const pollen = data.pollen;

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-lime-500/10 text-lime-400 border border-lime-500/20">
            <Flower2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span>Pollen &amp; Allergen Outlook</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                Tomorrow.io
              </span>
            </h3>
            <p className="text-xs text-slate-400">Airborne allergen concentrations &amp; health risk</p>
          </div>
        </div>

        <div
          className={`px-3 py-1 rounded-full text-xs font-bold border ${
            pollen.overallRisk === 'High' || pollen.overallRisk === 'Very High'
              ? 'bg-rose-500/20 text-rose-300 border-rose-500/30'
              : pollen.overallRisk === 'Moderate'
              ? 'bg-amber-500/20 text-amber-300 border-amber-500/30'
              : 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30'
          }`}
        >
          {pollen.overallRisk} Allergy Risk
        </div>
      </div>

      {/* 3 Main Pollen Groups */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {/* Tree Pollen */}
        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Trees className="w-4 h-4 text-emerald-400" />
              <span>Tree Pollen</span>
            </div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-md"
              style={{ backgroundColor: `${pollen.tree.color}20`, color: pollen.tree.color }}
            >
              {pollen.tree.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className="h-2 flex-1 rounded-full"
                style={{
                  backgroundColor: lvl <= pollen.tree.index ? pollen.tree.color : 'rgba(255,255,255,0.08)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Grass Pollen */}
        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Wheat className="w-4 h-4 text-lime-400" />
              <span>Grass Pollen</span>
            </div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-md"
              style={{ backgroundColor: `${pollen.grass.color}20`, color: pollen.grass.color }}
            >
              {pollen.grass.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className="h-2 flex-1 rounded-full"
                style={{
                  backgroundColor: lvl <= pollen.grass.index ? pollen.grass.color : 'rgba(255,255,255,0.08)',
                }}
              />
            ))}
          </div>
        </div>

        {/* Weed Pollen */}
        <div className="p-4 rounded-2xl bg-black/30 border border-white/5 space-y-2">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <Sprout className="w-4 h-4 text-amber-400" />
              <span>Weed Pollen</span>
            </div>
            <span
              className="text-xs font-bold px-2 py-0.5 rounded-md"
              style={{ backgroundColor: `${pollen.weed.color}20`, color: pollen.weed.color }}
            >
              {pollen.weed.category}
            </span>
          </div>

          <div className="flex items-center gap-1.5 pt-1">
            {[1, 2, 3, 4, 5].map((lvl) => (
              <div
                key={lvl}
                className="h-2 flex-1 rounded-full"
                style={{
                  backgroundColor: lvl <= pollen.weed.index ? pollen.weed.color : 'rgba(255,255,255,0.08)',
                }}
              />
            ))}
          </div>
        </div>
      </div>

      <div className="p-3 rounded-xl bg-white/5 border border-white/5 text-xs text-slate-300 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-cyan-400 flex-shrink-0 mt-0.5" />
        <p className="leading-relaxed">{pollen.advice}</p>
      </div>
    </div>
  );
}
