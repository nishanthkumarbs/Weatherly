'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { useTheme } from '@/lib/context/ThemeContext';
import {
  CloudRain,
  Cloud,
  Wind,
  Thermometer,
  Compass,
  Sliders,
  Maximize2,
} from 'lucide-react';

type MapLayerType = 'precipitation_new' | 'clouds_new' | 'wind_new' | 'temp_new';

interface LayerOption {
  id: MapLayerType;
  label: string;
  icon: React.ReactNode;
  unit: string;
}

const LAYER_OPTIONS: LayerOption[] = [
  { id: 'precipitation_new', label: 'Precipitation', icon: <CloudRain className="w-4 h-4" />, unit: 'mm/h' },
  { id: 'clouds_new', label: 'Clouds', icon: <Cloud className="w-4 h-4" />, unit: '%' },
  { id: 'wind_new', label: 'Wind Speed', icon: <Wind className="w-4 h-4" />, unit: 'm/s' },
  { id: 'temp_new', label: 'Temperature', icon: <Thermometer className="w-4 h-4" />, unit: '°C' },
];

export default function WeatherMap({ height = '450px' }: { height?: string }) {
  const { currentLocation, setActiveMapModal } = useWeather();
  const { theme } = useTheme();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const weatherTileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('precipitation_new');
  const [opacity, setOpacity] = useState<number>(0.75);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Initialize Leaflet Map
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;

      if (isCancelled || !mapContainerRef.current) return;

      // Fix default marker icon paths in webpack/Next.js
      delete (L.Icon.Default.prototype as { _getIconUrl?: unknown })._getIconUrl;
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
        iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
        shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
      });

      const map = L.map(mapContainerRef.current, {
        center: [currentLocation.lat, currentLocation.lon],
        zoom: 7,
        zoomControl: false,
      });

      L.control.zoom({ position: 'bottomright' }).addTo(map);

      // OpenStreetMap Base Tiles (100% free, no API key required)
      const basemapUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';

      L.tileLayer(basemapUrl, {
        className: 'map-tiles-base',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Weather overlay layer (proxied via /api/map-tiles)
      const weatherLayer = L.tileLayer(`/api/map-tiles/${activeLayer}/{z}/{x}/{y}`, {
        opacity,
        maxZoom: 18,
      }).addTo(map);

      // Add pin at current coordinates
      const marker = L.marker([currentLocation.lat, currentLocation.lon])
        .addTo(map)
        .bindPopup(`<strong>${currentLocation.name}</strong><br/>Lat: ${currentLocation.lat.toFixed(2)}, Lon: ${currentLocation.lon.toFixed(2)}`);

      mapInstanceRef.current = map;
      weatherTileLayerRef.current = weatherLayer;
      markerRef.current = marker;
      setMapLoaded(true);
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [theme]); // re-init on theme change

  // Update weather layer when layer type or opacity changes
  useEffect(() => {
    if (!mapInstanceRef.current || !weatherTileLayerRef.current) return;
    weatherTileLayerRef.current.setUrl(`/api/map-tiles/${activeLayer}/{z}/{x}/{y}`);
    weatherTileLayerRef.current.setOpacity(opacity);
  }, [activeLayer, opacity]);

  // Center map when location updates
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([currentLocation.lat, currentLocation.lon], 7);
    if (markerRef.current) {
      markerRef.current.setLatLng([currentLocation.lat, currentLocation.lon]);
      markerRef.current.setPopupContent(`<strong>${currentLocation.name}</strong><br/>Lat: ${currentLocation.lat.toFixed(2)}, Lon: ${currentLocation.lon.toFixed(2)}`);
    }
  }, [currentLocation]);

  const recenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([currentLocation.lat, currentLocation.lon], 8, { animate: true });
  };

  return (
    <div className="glass-panel p-6 space-y-4 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white">Live Meteorological Radar &amp; Satellite</h3>
            <p className="text-xs text-slate-400">Interactive OpenWeatherMap multi-layer map</p>
          </div>
        </div>

        {/* Controls Toolbar */}
        <div className="flex items-center gap-2 flex-wrap">
          <div className="flex bg-black/40 p-1 rounded-xl border border-white/10 gap-1">
            {LAYER_OPTIONS.map((layer) => (
              <button
                key={layer.id}
                type="button"
                onClick={() => setActiveLayer(layer.id)}
                className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeLayer === layer.id
                    ? 'bg-cyan-500 text-white shadow'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {layer.icon}
                <span className="hidden sm:inline">{layer.label}</span>
              </button>
            ))}
          </div>

          <button
            type="button"
            onClick={recenter}
            title="Recenter on current city"
            className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Compass className="w-4 h-4 text-cyan-400" />
          </button>

          <button
            type="button"
            onClick={() => setActiveMapModal(true)}
            title="Open Fullscreen Radar"
            className="p-1.5 rounded-xl bg-white/5 border border-white/10 text-slate-300 hover:text-white hover:bg-white/10 transition-colors"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Interactive Map Canvas */}
      <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl" style={{ height }}>
        <div ref={mapContainerRef} className="w-full h-full" />

        {/* Floating Opacity & Legend Capsule */}
        <div className="absolute bottom-3 left-3 z-[400] bg-slate-900/90 backdrop-blur-md border border-white/15 p-2.5 rounded-xl shadow-xl flex items-center gap-3 text-xs text-slate-300">
          <div className="flex items-center gap-1.5">
            <Sliders className="w-3.5 h-3.5 text-cyan-400" />
            <span className="text-[11px] font-medium hidden sm:inline">Opacity:</span>
            <input
              type="range"
              min="0.2"
              max="1"
              step="0.05"
              value={opacity}
              onChange={(e) => setOpacity(parseFloat(e.target.value))}
              className="w-20 accent-cyan-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
            />
          </div>

          <div className="h-4 w-px bg-white/15" />

          {/* Active Legend Scale */}
          <div className="flex items-center gap-2 text-[11px]">
            <span className="capitalize font-semibold text-white">
              {activeLayer.replace('_new', '')}:
            </span>
            {activeLayer === 'precipitation_new' && (
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Light</span>
                <div className="h-2 w-14 rounded-full bg-gradient-to-r from-sky-400 via-blue-500 to-indigo-700" />
                <span className="text-slate-400">Heavy</span>
              </div>
            )}
            {activeLayer === 'clouds_new' && (
              <div className="flex items-center gap-1">
                <span className="text-slate-400">0%</span>
                <div className="h-2 w-14 rounded-full bg-gradient-to-r from-slate-600 to-white" />
                <span className="text-slate-400">100%</span>
              </div>
            )}
            {activeLayer === 'temp_new' && (
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Cold</span>
                <div className="h-2 w-14 rounded-full bg-gradient-to-r from-blue-500 via-yellow-400 to-rose-600" />
                <span className="text-slate-400">Hot</span>
              </div>
            )}
            {activeLayer === 'wind_new' && (
              <div className="flex items-center gap-1">
                <span className="text-slate-400">Calm</span>
                <div className="h-2 w-14 rounded-full bg-gradient-to-r from-teal-400 via-green-500 to-rose-500" />
                <span className="text-slate-400">Gale</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
