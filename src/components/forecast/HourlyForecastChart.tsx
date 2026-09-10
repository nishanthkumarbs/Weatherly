'use client';

import React, { useState, useEffect } from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { useUnits } from '@/lib/context/UnitsContext';
import { formatTemperature, formatTempNumber, formatSpeed, formatHour } from '@/lib/utils/formatters';
import { WeatherIcon } from '@/lib/utils/weather-icons';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Legend,
} from 'recharts';
import { Clock, TrendingUp, LayoutGrid, GitCompare, ShieldCheck } from 'lucide-react';

interface MultiModelData {
  hours: Array<{
    time: string;
    isoTime: string;
    ecmwf: number;
    gfs: number;
    icon: number;
    min: number;
    max: number;
    spread: number;
    avg: number;
    confidence: string;
  }>;
  models: string[];
  overallConfidence: string;
  avgSpread: number;
}

export function HourlyForecastChart() {
  const { data } = useWeather();
  const { tempUnit, speedUnit } = useUnits();
  const [viewMode, setViewMode] = useState<'chart' | 'models' | 'cards'>('chart');
  const [multiModelData, setMultiModelData] = useState<MultiModelData | null>(null);
  const [loadingModels, setLoadingModels] = useState(false);

  useEffect(() => {
    if (!data) return;
    setLoadingModels(true);
    fetch(`/api/multi-model?lat=${data.location.lat}&lon=${data.location.lon}`)
      .then((res) => (res.ok ? res.json() : null))
      .then((json) => {
        if (json && Array.isArray(json.hours)) setMultiModelData(json);
      })
      .catch((err) => console.warn('Could not load multi-model data:', err))
      .finally(() => setLoadingModels(false));
  }, [data?.location.lat, data?.location.lon]);

  if (!data || !data.hourly || data.hourly.length === 0) return null;

  const hourly = data.hourly.slice(0, 48);

  const chartData = hourly.map((h) => ({
    time: formatHour(h.dt),
    temp: formatTempNumber(h.temp, tempUnit),
    feelsLike: formatTempNumber(h.feels_like, tempUnit),
    pop: Math.round(h.pop * 100),
    wind: h.wind_speed,
    condition: h.condition,
    description: h.description,
    rawTemp: h.temp,
    dt: h.dt,
  }));

  // Prepare multi-model chart data with unit conversion
  const modelChartData =
    multiModelData?.hours.map((h) => ({
      time: h.time,
      ecmwf: formatTempNumber(h.ecmwf, tempUnit),
      gfs: formatTempNumber(h.gfs, tempUnit),
      icon: formatTempNumber(h.icon, tempUnit),
      min: formatTempNumber(h.min, tempUnit),
      max: formatTempNumber(h.max, tempUnit),
      spread: formatTempNumber(h.spread, tempUnit),
      confidence: h.confidence,
    })) || [];

  const temps = chartData.map((d) => d.temp);
  const minTemp = Math.floor(Math.min(...temps) - 2);
  const maxTemp = Math.ceil(Math.max(...temps) + 2);

  return (
    <div className="glass-panel p-6 space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-blue-500/10 text-blue-400 border border-blue-500/20">
            <Clock className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-bold text-base text-white">48-Hour Outlook</h3>
              {viewMode === 'models' && multiModelData && (
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-cyan-500/20 text-cyan-300 border border-cyan-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3 text-cyan-400" />
                  {multiModelData.overallConfidence}
                </span>
              )}
            </div>
            <p className="text-xs text-slate-400">
              {viewMode === 'models'
                ? 'Multi-model spread & confidence (ECMWF, GFS, ICON)'
                : 'High-resolution temperature & precipitation trend curve'}
            </p>
          </div>
        </div>

        {/* View Toggle */}
        <div className="flex items-center bg-black/40 p-1 rounded-xl border border-white/10 self-start sm:self-auto gap-1">
          <button
            type="button"
            onClick={() => setViewMode('chart')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'chart'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Trend</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('models')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'models'
                ? 'bg-cyan-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <GitCompare className="w-3.5 h-3.5" />
            <span>Multi-Model</span>
          </button>

          <button
            type="button"
            onClick={() => setViewMode('cards')}
            className={`flex items-center gap-1.5 px-3 py-1 text-xs font-semibold rounded-lg transition-all ${
              viewMode === 'cards'
                ? 'bg-blue-500 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LayoutGrid className="w-3.5 h-3.5" />
            <span>Cards</span>
          </button>
        </div>
      </div>

      {viewMode === 'chart' && (
        <div className="h-64 w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="tempGradient" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#38bdf8" stopOpacity={0.4} />
                  <stop offset="95%" stopColor="#38bdf8" stopOpacity={0.0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
              <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} interval={3} />
              <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={[minTemp, maxTemp]} />
              <Tooltip
                content={({ active, payload }) => {
                  if (!active || !payload || !payload.length) return null;
                  const item = payload[0].payload;
                  return (
                    <div className="bg-slate-900/95 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-2xl text-xs space-y-1.5">
                      <p className="font-bold text-cyan-300">{item.time}</p>
                      <p className="text-white font-semibold flex items-center justify-between gap-4">
                        <span>Temperature:</span>
                        <span className="text-cyan-400">{formatTemperature(item.rawTemp, tempUnit)}</span>
                      </p>
                      <p className="text-slate-300 flex items-center justify-between gap-4">
                        <span>Precip Probability:</span>
                        <span className="text-indigo-400 font-bold">{item.pop}%</span>
                      </p>
                      <p className="text-slate-300 capitalize flex items-center justify-between gap-4">
                        <span>Conditions:</span>
                        <span>{item.description}</span>
                      </p>
                    </div>
                  );
                }}
              />
              <Area
                type="monotone"
                dataKey="temp"
                stroke="#38bdf8"
                strokeWidth={2.5}
                fillOpacity={1}
                fill="url(#tempGradient)"
                name="Temperature"
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* Multi-Model Comparison View */}
      {viewMode === 'models' && (
        <div className="space-y-3">
          <div className="h-64 w-full pt-1">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={modelChartData} margin={{ top: 15, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" vertical={false} />
                <XAxis dataKey="time" stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} interval={3} />
                <YAxis stroke="#64748b" fontSize={11} tickLine={false} axisLine={false} domain={['auto', 'auto']} />
                <Tooltip
                  content={({ active, payload }) => {
                    if (!active || !payload || !payload.length) return null;
                    const d = payload[0].payload;
                    return (
                      <div className="bg-slate-900/95 backdrop-blur-md border border-white/20 p-3 rounded-xl shadow-2xl text-xs space-y-1.5 min-w-[200px]">
                        <p className="font-bold text-cyan-300">{d.time}</p>
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between">
                            <span className="text-sky-400">ECMWF (European):</span>
                            <strong className="text-white">{d.ecmwf}°</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-amber-400">GFS (US / NOAA):</span>
                            <strong className="text-white">{d.gfs}°</strong>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-purple-400">ICON (German DWD):</span>
                            <strong className="text-white">{d.icon}°</strong>
                          </div>
                          <div className="border-t border-white/10 pt-1 flex items-center justify-between text-slate-400">
                            <span>Model Spread:</span>
                            <strong className="text-slate-200">±{d.spread}°</strong>
                          </div>
                        </div>
                      </div>
                    );
                  }}
                />
                <Legend
                  wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }}
                  iconType="circle"
                  iconSize={8}
                />
                <Line
                  type="monotone"
                  dataKey="ecmwf"
                  name="ECMWF (European)"
                  stroke="#38bdf8"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="gfs"
                  name="GFS (NOAA / US)"
                  stroke="#f59e0b"
                  strokeWidth={2}
                  dot={false}
                />
                <Line
                  type="monotone"
                  dataKey="icon"
                  name="ICON (German)"
                  stroke="#c084fc"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          <div className="p-3 rounded-xl bg-black/40 border border-white/5 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs text-slate-400">
            <span>
              <strong>Confidence Analysis:</strong> Shaded agreement between Europe&apos;s ECMWF, US NOAA GFS, and German ICON models.
            </span>
            <span className="font-mono text-cyan-300">Avg spread: ±{multiModelData?.avgSpread ?? 1.2}°C</span>
          </div>
        </div>
      )}

      {viewMode === 'cards' && (
        <div className="flex gap-3 overflow-x-auto pb-3 pt-1 custom-scrollbar">
          {hourly.map((h, i) => {
            const isDay = new Date(h.dt * 1000).getHours() >= 6 && new Date(h.dt * 1000).getHours() <= 18;
            return (
              <div
                key={h.dt}
                className="flex-shrink-0 flex flex-col items-center justify-between p-3.5 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all w-24 text-center space-y-2"
              >
                <span className="text-xs text-slate-400 font-medium">{i === 0 ? 'Now' : formatHour(h.dt)}</span>
                <WeatherIcon code={h.icon} condition={h.condition} isDay={isDay} className="w-8 h-8" />
                <div>
                  <p className="text-sm font-bold text-white">{formatTemperature(h.temp, tempUnit)}</p>
                  {h.pop > 0.1 && (
                    <span className="text-[10px] font-bold text-sky-400 bg-sky-500/10 px-1.5 py-0.2 rounded-full mt-0.5 inline-block">
                      {Math.round(h.pop * 100)}%
                    </span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400 font-mono">{formatSpeed(h.wind_speed, speedUnit)}</span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
