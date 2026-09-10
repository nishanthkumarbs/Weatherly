'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
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
  Play,
  Pause,
  RotateCcw,
  Clock,
} from 'lucide-react';

type MapLayerType = 'radar_rainviewer' | 'clouds_new' | 'wind_new' | 'temp_new';

interface LayerOption {
  id: MapLayerType;
  label: string;
  icon: React.ReactNode;
  unit: string;
}

const LAYER_OPTIONS: LayerOption[] = [
  { id: 'radar_rainviewer', label: 'Radar Loop', icon: <CloudRain className="w-4 h-4" />, unit: 'dBZ' },
  { id: 'clouds_new', label: 'Clouds', icon: <Cloud className="w-4 h-4" />, unit: '%' },
  { id: 'wind_new', label: 'Wind', icon: <Wind className="w-4 h-4" />, unit: 'm/s' },
  { id: 'temp_new', label: 'Temp', icon: <Thermometer className="w-4 h-4" />, unit: '°C' },
];

interface RadarFrame {
  time: number;
  path: string;
}

export default function WeatherMap({ height = '460px' }: { height?: string }) {
  const { currentLocation, setActiveMapModal } = useWeather();
  const { theme } = useTheme();

  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const weatherTileLayerRef = useRef<L.TileLayer | null>(null);
  const markerRef = useRef<L.Marker | null>(null);

  const [activeLayer, setActiveLayer] = useState<MapLayerType>('radar_rainviewer');
  const [opacity, setOpacity] = useState<number>(0.8);

  // RainViewer Radar Frames State
  const [radarHost, setRadarHost] = useState<string>('https://tilecache.rainviewer.com');
  const [radarFrames, setRadarFrames] = useState<RadarFrame[]>([]);
  const [activeFrameIndex, setActiveFrameIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const playIntervalRef = useRef<NodeJS.Timeout | null>(null);

  // 1. Fetch RainViewer radar timestamps
  useEffect(() => {
    async function loadRainViewerData() {
      try {
        const res = await fetch('https://api.rainviewer.com/public/weather-maps.json');
        if (res.ok) {
          const json = await res.json();
          if (json.host && Array.isArray(json.radar?.past) && json.radar.past.length > 0) {
            setRadarHost(json.host);
            const frames: RadarFrame[] = json.radar.past;
            // Also append nowcast frame if available
            if (Array.isArray(json.radar?.nowcast) && json.radar.nowcast.length > 0) {
              frames.push(...json.radar.nowcast.slice(0, 3));
            }
            setRadarFrames(frames);
            setActiveFrameIndex(frames.length - 1); // latest frame by default
          }
        }
      } catch (err) {
        console.warn('Could not load RainViewer frames:', err);
      }
    }
    loadRainViewerData();
  }, []);

  // Compute tile URL based on active layer and radar frame index
  const getOverlayTileUrl = useCallback(
    (layer: MapLayerType, frameIdx: number): string => {
      if (layer === 'radar_rainviewer' && radarFrames.length > 0) {
        const frame = radarFrames[frameIdx] || radarFrames[radarFrames.length - 1];
        return `${radarHost}${frame.path}/256/{z}/{x}/{y}/2/1_1.png`;
      }
      return `/api/map-tiles/${layer}/{z}/{x}/{y}`;
    },
    [radarFrames, radarHost]
  );

  // 2. Initialize Leaflet Map
  useEffect(() => {
    let isCancelled = false;

    async function initMap() {
      if (typeof window === 'undefined' || !mapContainerRef.current) return;
      if (mapInstanceRef.current) return;

      const L = (await import('leaflet')).default;
      if (isCancelled || !mapContainerRef.current) return;

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

      // OpenStreetMap Base Tiles (100% free, zero API key required)
      const basemapUrl = 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png';
      L.tileLayer(basemapUrl, {
        className: 'map-tiles-base',
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      // Weather Overlay Layer
      const initialUrl = getOverlayTileUrl(activeLayer, activeFrameIndex);
      const weatherLayer = L.tileLayer(initialUrl, {
        opacity,
        maxZoom: 18,
      }).addTo(map);

      // Location Marker
      const marker = L.marker([currentLocation.lat, currentLocation.lon])
        .addTo(map)
        .bindPopup(
          `<strong>${currentLocation.name}</strong><br/>Lat: ${currentLocation.lat.toFixed(2)}, Lon: ${currentLocation.lon.toFixed(2)}`
        );

      mapInstanceRef.current = map;
      weatherTileLayerRef.current = weatherLayer;
      markerRef.current = marker;
    }

    initMap();

    return () => {
      isCancelled = true;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, [theme]); // re-init on theme switch

  // 3. Update Weather Tile URL when layer, frame, or opacity changes
  useEffect(() => {
    if (!weatherTileLayerRef.current) return;
    const newUrl = getOverlayTileUrl(activeLayer, activeFrameIndex);
    weatherTileLayerRef.current.setUrl(newUrl);
    weatherTileLayerRef.current.setOpacity(opacity);
  }, [activeLayer, activeFrameIndex, opacity, getOverlayTileUrl]);

  // 4. Center map when location updates
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([currentLocation.lat, currentLocation.lon], 7);
    if (markerRef.current) {
      markerRef.current.setLatLng([currentLocation.lat, currentLocation.lon]);
      markerRef.current.setPopupContent(
        `<strong>${currentLocation.name}</strong><br/>Lat: ${currentLocation.lat.toFixed(2)}, Lon: ${currentLocation.lon.toFixed(2)}`
      );
    }
  }, [currentLocation]);

  // 5. Radar Play/Pause Animation Loop
  useEffect(() => {
    if (isPlaying && radarFrames.length > 0) {
      playIntervalRef.current = setInterval(() => {
        setActiveFrameIndex((prev) => (prev + 1) % radarFrames.length);
      }, 700);
    } else {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    }

    return () => {
      if (playIntervalRef.current) clearInterval(playIntervalRef.current);
    };
  }, [isPlaying, radarFrames.length]);

  const recenter = () => {
    if (!mapInstanceRef.current) return;
    mapInstanceRef.current.setView([currentLocation.lat, currentLocation.lon], 8, { animate: true });
  };

  const currentFrameTime = radarFrames[activeFrameIndex]?.time
    ? new Date(radarFrames[activeFrameIndex].time * 1000).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      })
    : 'Live';

  const isLatestFrame = activeFrameIndex === radarFrames.length - 1;

  return (
    <div className="glass-panel p-6 space-y-4 relative">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <CloudRain className="w-4 h-4" />
          </div>
          <div>
            <h3 className="font-bold text-base text-white flex items-center gap-2">
              <span>Interactive Meteorological Radar &amp; Satellite</span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-cyan-500/20 text-cyan-300 border border-cyan-500/30">
                RainViewer Live
              </span>
            </h3>
            <p className="text-xs text-slate-400">Past 2-hour playback scrubbing + animated radar loops</p>
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
        <div className="absolute top-3 right-3 z-[400] bg-slate-900/90 backdrop-blur-md border border-white/15 p-2 rounded-xl shadow-xl flex items-center gap-2.5 text-xs text-slate-300">
          <Sliders className="w-3.5 h-3.5 text-cyan-400" />
          <span className="text-[11px] font-medium hidden sm:inline">Opacity:</span>
          <input
            type="range"
            min="0.2"
            max="1"
            step="0.05"
            value={opacity}
            onChange={(e) => setOpacity(parseFloat(e.target.value))}
            className="w-16 accent-cyan-400 h-1 bg-slate-700 rounded-lg cursor-pointer"
          />
        </div>

        {/* Timeline Scrubber Bar (Past 2 Hours) */}
        {activeLayer === 'radar_rainviewer' && radarFrames.length > 0 && (
          <div className="absolute bottom-3 left-3 right-3 z-[400] bg-slate-950/90 backdrop-blur-xl border border-white/20 p-3 rounded-2xl shadow-2xl flex flex-col gap-2">
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsPlaying(!isPlaying)}
                  className="p-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-400 text-white font-bold transition-all shadow-md shadow-cyan-500/20"
                >
                  {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                </button>

                <div className="flex items-center gap-1.5 font-mono text-xs">
                  <Clock className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold text-white">{currentFrameTime}</span>
                  {isLatestFrame ? (
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-1.5 py-0.2 rounded font-sans font-bold">
                      LIVE
                    </span>
                  ) : (
                    <span className="text-[10px] bg-white/10 text-slate-400 px-1.5 py-0.2 rounded font-sans">
                      Past
                    </span>
                  )}
                </div>
              </div>

              <div className="flex items-center gap-2 text-[11px] text-slate-400">
                <button
                  type="button"
                  onClick={() => setActiveFrameIndex(radarFrames.length - 1)}
                  className="hover:text-cyan-300 text-slate-400 text-[11px] underline transition-colors"
                >
                  Jump to Latest
                </button>
              </div>
            </div>

            {/* Time Slider */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] text-slate-400 font-mono">-2h</span>
              <input
                type="range"
                min="0"
                max={radarFrames.length - 1}
                value={activeFrameIndex}
                onChange={(e) => {
                  setIsPlaying(false);
                  setActiveFrameIndex(parseInt(e.target.value, 10));
                }}
                className="w-full accent-cyan-400 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
              />
              <span className="text-[10px] text-cyan-400 font-mono font-bold">Now</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
