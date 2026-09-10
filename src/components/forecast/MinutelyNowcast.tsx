'use client';

import React from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { useUnits } from '@/lib/context/UnitsContext';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Cell } from 'recharts';
import { CloudRain, CheckCircle2, Clock } from 'lucide-react';

export function MinutelyNowcast() {
  const { data } = useWeather();
  const { precipUnit } = useUnits();

  if (!data || !data.minutely || data.minutely.length === 0) return null;

  const minutely = data.minutely;
  const isRainingNow = minutely[0]?.precipitationIntensity > 0;
  const rainIndex = minutely.findIndex((m) => m.precipitationIntensity > 0);
  const stopIndex = minutely.findIndex((m, idx) => idx > 0 && m.precipitationIntensity === 0);

  let nowcastHeadline = 'No precipitation expected in the next 60 minutes';
  let badgeColor = 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30';

  if (isRainingNow) {
    if (stopIndex !== -1) {
      nowcastHeadline = `Rain expected to stop in ~${stopIndex} minutes`;
    } else {
      nowcastHeadline = 'Continuous precipitation for at least the next hour';
    }
    badgeColor = 'bg-sky-500/20 text-sky-300 border-sky-500/30';
  } else if (rainIndex !== -1) {
    nowcastHeadline = `Precipitation starting in ~${rainIndex} minutes`;
    badgeColor = 'bg-amber-500/20 text-amber-300 border-amber-500/30';
  }

  // Prepare chart data with 5-minute ticks for cleanliness
  const chartData = minutely.map((m, index) => ({
    minute: index,
    label: index === 0 ? 'Now' : `+${index}m`,
    intensity: m.precipitationIntensity,
    probability: m.precipitationProbability,
    type: m.precipitationType,
  }));

  const maxIntensity = Math.max(...minutely.map((m) => m.precipitationIntensity), 1);

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span>60-Minute Precipitation Nowcast</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-white/10 text-slate-300">
                Tomorrow.io
              </span>
            </h3>
            <p className="text-xs text-slate-400">Hyperlocal minute-by-minute radar tracking</p>
          </div>
        </div>

        <div className={`px-3 py-1.5 rounded-full border text-xs font-semibold flex items-center gap-2 ${badgeColor}`}>
          {isRainingNow || rainIndex !== -1 ? (
            <CloudRain className="w-3.5 h-3.5" />
          ) : (
            <CheckCircle2 className="w-3.5 h-3.5" />
          )}
          <span>{nowcastHeadline}</span>
        </div>
      </div>

      {/* Recharts 60-min Bar Visualization */}
      <div className="h-40 w-full pt-2">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} margin={{ top: 10, right: 10, left: -25, bottom: 0 }}>
            <XAxis
              dataKey="minute"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              ticks={[0, 15, 30, 45, 60]}
              tickFormatter={(val) => (val === 0 ? 'Now' : `${val}m`)}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              domain={[0, Math.max(3, Math.ceil(maxIntensity))]}
              tickFormatter={(v) => `${v} ${precipUnit}`}
            />
            <Tooltip
              content={({ active, payload }) => {
                if (!active || !payload || !payload.length) return null;
                const d = payload[0].payload;
                return (
                  <div className="bg-slate-900/95 backdrop-blur-md border border-white/20 p-2.5 rounded-xl text-xs text-white shadow-xl space-y-1">
                    <p className="font-bold text-cyan-300">Minute {d.minute} ({d.label})</p>
                    <p className="text-slate-300">
                      Intensity: <strong className="text-white">{d.intensity} mm/h</strong>
                    </p>
                    <p className="text-slate-300">
                      Probability: <strong className="text-white">{d.probability}%</strong>
                    </p>
                  </div>
                );
              }}
            />
            <Bar dataKey="intensity" radius={[2, 2, 0, 0]}>
              {chartData.map((entry, idx) => {
                let fill = '#38bdf8'; // light rain
                if (entry.intensity > 2.5) fill = '#2563eb'; // heavy
                else if (entry.intensity > 1) fill = '#0ea5e9'; // moderate
                else if (entry.intensity === 0) fill = '#334155'; // dry tick
                return <Cell key={`cell-${idx}`} fill={fill} opacity={entry.intensity === 0 ? 0.3 : 0.9} />;
              })}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div className="flex items-center justify-between text-[11px] text-slate-400 border-t border-white/5 pt-2">
        <span>Intensity scale: Light (0.1–1mm/h) · Moderate (1–2.5mm/h) · Heavy (&gt;2.5mm/h)</span>
        <span className="text-slate-500 font-mono">Updated continuously</span>
      </div>
    </div>
  );
}
