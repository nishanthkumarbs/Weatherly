'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { useUnits } from '@/lib/context/UnitsContext';
import { useTheme } from '@/lib/context/ThemeContext';
import {
  Search,
  MapPin,
  Compass,
  RotateCw,
  Sun,
  Moon,
  Sparkles,
  Layers,
  Check,
  Settings2,
  AlertCircle,
  X,
} from 'lucide-react';

export function Header() {
  const {
    data,
    refreshing,
    refreshWeather,
    searchQuery,
    setSearchQuery,
    searchResults,
    searching,
    setLocation,
    detectUserLocation,
    setActiveMapModal,
  } = useWeather();

  const {
    tempUnit,
    toggleTempUnit,
    speedUnit,
    setSpeedUnit,
    precipUnit,
    setPrecipUnit,
    pressureUnit,
    setPressureUnit,
  } = useUnits();

  const { theme, toggleTheme, dynamicBg, toggleDynamicBg } = useTheme();

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const settingsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      setPushEnabled(true);
    }
  }, []);

  const handlePushToggle = async () => {
    if (typeof window === 'undefined' || !('serviceWorker' in navigator) || !('Notification' in window)) {
      alert('Push notifications are not supported in this browser.');
      return;
    }

    if (pushEnabled) {
      setPushEnabled(false);
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        alert('Notification permission was denied.');
        return;
      }

      const reg = await navigator.serviceWorker.ready;
      const keyRes = await fetch('/api/push/subscribe');
      const { publicKey } = await keyRes.json();

      const padding = '='.repeat((4 - (publicKey.length % 4)) % 4);
      const base64 = (publicKey + padding).replace(/-/g, '+').replace(/_/g, '/');
      const rawData = window.atob(base64);
      const outputArray = new Uint8Array(rawData.length);
      for (let i = 0; i < rawData.length; ++i) {
        outputArray[i] = rawData.charCodeAt(i);
      }

      const sub = await reg.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: outputArray,
      });

      await fetch('/api/push/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscription: sub,
          lat: data?.location.lat,
          lon: data?.location.lon,
          cityName: data?.location.name,
        }),
      });

      setPushEnabled(true);
      alert('Subscribed to severe weather push notifications!');
    } catch (err) {
      console.warn('Push subscription failed:', err);
      alert('Could not enable push notifications.');
    }
  };

  const handleTestPush = async () => {
    try {
      const res = await fetch('/api/push/send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: '⚠️ Severe Alert Test',
          message: `Testing NWS emergency alert push notification for ${data?.location.name || 'your area'}.`,
        }),
      });
      const json = await res.json();
      if (json.success) {
        alert('Test notification sent!');
      } else {
        alert(json.message || 'Failed to send test push.');
      }
    } catch {
      alert('Failed to trigger test push.');
    }
  };

  // Close search dropdown on outside click
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
      if (settingsRef.current && !settingsRef.current.contains(e.target as Node)) {
        setSettingsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <header className="sticky top-0 z-40 w-full backdrop-blur-xl bg-slate-950/60 border-b border-white/10 transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-blue-500 to-indigo-600 flex items-center justify-center shadow-lg shadow-cyan-500/20 text-white font-black text-xl">
            W
          </div>
          <div className="hidden sm:block">
            <div className="flex items-center gap-1.5">
              <span className="font-extrabold text-lg tracking-tight text-white drop-shadow-sm">
                Weatherly
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                PRO
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">Hyperlocal Precision</p>
          </div>
        </div>

        {/* Search Bar & Geolocation Autocomplete */}
        <div ref={searchRef} className="relative flex-1 max-w-lg">
          <div className="relative flex items-center">
            <Search className="absolute left-3.5 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              id="city-search-input"
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setDropdownOpen(true);
              }}
              onFocus={() => setDropdownOpen(true)}
              placeholder="Search city, postal code, or airport..."
              className="w-full pl-10 pr-20 py-2 text-sm rounded-full bg-slate-900/80 border border-white/10 text-white placeholder-slate-400 focus:outline-none focus:border-cyan-400 focus:ring-1 focus:ring-cyan-400/50 transition-all shadow-inner"
            />

            <div className="absolute right-1.5 flex items-center gap-1">
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery('')}
                  className="p-1 rounded-full text-slate-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
              <button
                type="button"
                id="geolocation-btn"
                onClick={detectUserLocation}
                title="Use current GPS location"
                className="p-1.5 rounded-full text-cyan-400 hover:text-cyan-200 hover:bg-cyan-500/20 transition-all"
              >
                <Compass className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Autocomplete dropdown */}
          {dropdownOpen && (searchResults.length > 0 || searching) && (
            <div className="absolute left-0 right-0 mt-2 py-2 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-50 overflow-hidden divide-y divide-white/5">
              {searching && (
                <div className="px-4 py-3 text-xs text-slate-400 flex items-center gap-2">
                  <div className="w-3 h-3 border-2 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                  Searching global locations...
                </div>
              )}
              {searchResults.map((loc, i) => (
                <button
                  key={`${loc.lat}-${loc.lon}-${i}`}
                  type="button"
                  onClick={() => {
                    setLocation(loc.lat, loc.lon, `${loc.name}${loc.country ? `, ${loc.country}` : ''}`);
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-2.5 text-left text-sm text-slate-200 hover:bg-cyan-500/15 hover:text-cyan-300 flex items-center justify-between transition-colors"
                >
                  <div className="flex items-center gap-2.5">
                    <MapPin className="w-4 h-4 text-cyan-400 flex-shrink-0" />
                    <div>
                      <span className="font-semibold text-white">{loc.name}</span>
                      {loc.state && <span className="text-xs text-slate-400 ml-1.5">{loc.state}</span>}
                      {loc.country && <span className="text-xs text-slate-400 ml-1.5 font-medium">({loc.country})</span>}
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-mono">
                    {loc.lat.toFixed(1)}°, {loc.lon.toFixed(1)}°
                  </span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Action Tools */}
        <div className="flex items-center gap-1.5 sm:gap-2">
          
          {/* Radar Map Launcher */}
          <button
            type="button"
            id="open-radar-map-btn"
            onClick={() => setActiveMapModal(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl bg-cyan-500/15 text-cyan-300 border border-cyan-500/30 hover:bg-cyan-500/25 transition-all shadow-sm"
          >
            <Layers className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden md:inline">Radar Map</span>
          </button>

          {/* Unit Toggle °C / °F */}
          <button
            type="button"
            id="unit-toggle-btn"
            onClick={toggleTempUnit}
            title={`Switch to ${tempUnit === 'celsius' ? 'Fahrenheit (°F)' : 'Celsius (°C)'}`}
            className="px-2.5 py-1.5 text-xs font-bold rounded-xl bg-white/10 text-white hover:bg-white/15 border border-white/10 transition-all font-mono"
          >
            {tempUnit === 'celsius' ? '°C' : '°F'}
          </button>

          {/* Refresh Action */}
          <button
            type="button"
            id="refresh-weather-btn"
            onClick={() => refreshWeather()}
            disabled={refreshing}
            title="Refresh forecast data"
            className="p-2 rounded-xl bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border border-white/10 transition-all"
          >
            <RotateCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-cyan-400' : ''}`} />
          </button>

          {/* Settings / Units & Theme Popover */}
          <div ref={settingsRef} className="relative">
            <button
              type="button"
              id="settings-menu-btn"
              onClick={() => setSettingsOpen(!settingsOpen)}
              title="Dashboard Settings & Units"
              className={`p-2 rounded-xl border transition-all ${
                settingsOpen
                  ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                  : 'bg-white/5 text-slate-300 hover:text-white hover:bg-white/10 border-white/10'
              }`}
            >
              <Settings2 className="w-4 h-4" />
            </button>

            {settingsOpen && (
              <div className="absolute right-0 mt-2 w-72 p-4 bg-slate-900/95 backdrop-blur-2xl border border-white/15 rounded-2xl shadow-2xl z-50 space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-white/10">
                  <span className="text-xs font-bold text-white uppercase tracking-wider">Preferences</span>
                  {data?.isDemoMode && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      Demo Mode
                    </span>
                  )}
                </div>

                {/* Units */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">Temperature</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => toggleTempUnit()}
                      className={`py-1 text-xs rounded-lg font-semibold transition-all ${
                        tempUnit === 'celsius' ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Celsius (°C)
                    </button>
                    <button
                      type="button"
                      onClick={() => toggleTempUnit()}
                      className={`py-1 text-xs rounded-lg font-semibold transition-all ${
                        tempUnit === 'fahrenheit' ? 'bg-cyan-500 text-white shadow' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Fahrenheit (°F)
                    </button>
                  </div>
                </div>

                {/* Wind Speed Units */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">Wind Speed</label>
                  <div className="grid grid-cols-3 gap-1 bg-black/30 p-1 rounded-xl border border-white/5">
                    {(['kmh', 'mph', 'ms'] as const).map((unit) => (
                      <button
                        key={unit}
                        type="button"
                        onClick={() => setSpeedUnit(unit)}
                        className={`py-1 text-[11px] font-semibold rounded-lg transition-all ${
                          speedUnit === unit ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                        }`}
                      >
                        {unit}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Precipitation Units */}
                <div className="space-y-2">
                  <label className="text-xs text-slate-400 font-medium">Precipitation</label>
                  <div className="grid grid-cols-2 gap-1.5 bg-black/30 p-1 rounded-xl border border-white/5">
                    <button
                      type="button"
                      onClick={() => setPrecipUnit('mm')}
                      className={`py-1 text-xs rounded-lg font-semibold transition-all ${
                        precipUnit === 'mm' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Millimeters (mm)
                    </button>
                    <button
                      type="button"
                      onClick={() => setPrecipUnit('inch')}
                      className={`py-1 text-xs rounded-lg font-semibold transition-all ${
                        precipUnit === 'inch' ? 'bg-cyan-500 text-white' : 'text-slate-400 hover:text-white'
                      }`}
                    >
                      Inches (in)
                    </button>
                  </div>
                </div>

                {/* Visuals: Theme & Atmosphere */}
                <div className="pt-2 border-t border-white/10 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Theme</span>
                    <button
                      type="button"
                      onClick={toggleTheme}
                      className="p-1.5 rounded-lg bg-white/10 hover:bg-white/15 text-slate-200 transition-colors flex items-center gap-1.5 text-xs"
                    >
                      {theme === 'dark' ? <Moon className="w-3.5 h-3.5 text-indigo-300" /> : <Sun className="w-3.5 h-3.5 text-amber-400" />}
                      <span className="capitalize">{theme}</span>
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-300">Atmospheric Sky FX</span>
                    <button
                      type="button"
                      onClick={toggleDynamicBg}
                      className={`px-2 py-1 rounded-lg text-xs font-medium transition-colors ${
                        dynamicBg
                          ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          : 'bg-white/10 text-slate-400'
                      }`}
                    >
                      {dynamicBg ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>

                  {/* Web Push Alerts */}
                  <div className="pt-2 border-t border-white/10 space-y-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="text-xs text-white font-medium block">Push Notifications</span>
                        <span className="text-[10px] text-slate-400 block">Severe NWS alerts</span>
                      </div>
                      <button
                        type="button"
                        onClick={handlePushToggle}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold transition-colors ${
                          pushEnabled
                            ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            : 'bg-white/10 text-slate-300 hover:bg-white/15'
                        }`}
                      >
                        {pushEnabled ? 'Subscribed' : 'Enable'}
                      </button>
                    </div>

                    {pushEnabled && (
                      <button
                        type="button"
                        onClick={handleTestPush}
                        className="w-full py-1 text-[11px] rounded-lg bg-cyan-500/15 text-cyan-300 border border-cyan-500/25 hover:bg-cyan-500/25 transition-colors font-medium text-center"
                      >
                        Send Test Push Notification
                      </button>
                    )}
                  </div>
                </div>

              </div>
            )}
          </div>

        </div>

      </div>

      {/* Demo Mode Notice Strip if keys not set */}
      {data?.isDemoMode && (
        <div className="bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/20 border-t border-b border-amber-500/30 px-4 py-1.5 text-center text-xs text-amber-200 flex items-center justify-center gap-2">
          <AlertCircle className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
          <span>
            <strong>Simulated Data Active:</strong> Add your free OpenWeather &amp; Tomorrow.io keys to <code className="bg-black/30 px-1 py-0.5 rounded text-[11px]">.env.local</code> to enable live satellite feeds.
          </span>
        </div>
      )}
    </header>
  );
}
