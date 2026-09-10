'use client';

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { WeatherDataResponse, LocationInfo } from '@/lib/types/weather';

interface WeatherContextType {
  data: WeatherDataResponse | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  currentLocation: { lat: number; lon: number; name: string };
  setLocation: (lat: number, lon: number, name?: string) => void;
  detectUserLocation: () => void;
  refreshWeather: () => Promise<void>;
  searchQuery: string;
  setSearchQuery: (q: string) => void;
  searchResults: LocationInfo[];
  searching: boolean;
  activeMapModal: boolean;
  setActiveMapModal: (open: boolean) => void;
}

const WeatherContext = createContext<WeatherContextType | undefined>(undefined);

const DEFAULT_COORDS = {
  lat: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LAT || '40.7128'),
  lon: parseFloat(process.env.NEXT_PUBLIC_DEFAULT_LON || '-74.0060'),
  name: process.env.NEXT_PUBLIC_DEFAULT_CITY || 'New York',
};

export function WeatherProvider({ children }: { children: React.ReactNode }) {
  const [currentLocation, setCurrentLocation] = useState(DEFAULT_COORDS);
  const [data, setData] = useState<WeatherDataResponse | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Search autocomplete state
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<LocationInfo[]>([]);
  const [searching, setSearching] = useState(false);

  // Modal radar map state
  const [activeMapModal, setActiveMapModal] = useState(false);

  // Fetch weather data
  const fetchWeather = useCallback(async (lat: number, lon: number, cityName?: string, isRefresh = false) => {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }
      setError(null);

      const params = new URLSearchParams({
        lat: lat.toString(),
        lon: lon.toString(),
      });
      if (cityName) params.set('city', cityName);

      const res = await fetch(`/api/weather?${params.toString()}`);
      if (!res.ok) {
        throw new Error(`Failed to fetch weather: ${res.statusText}`);
      }

      const weatherData: WeatherDataResponse = await res.json();
      setData(weatherData);

      // Save last location to localStorage
      try {
        localStorage.setItem(
          'weatherly_last_location',
          JSON.stringify({
            lat,
            lon,
            name: cityName || weatherData.location.name,
          })
        );
      } catch {}
    } catch (err: unknown) {
      console.error(err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  // Initial load: check localStorage, otherwise default
  useEffect(() => {
    try {
      const saved = localStorage.getItem('weatherly_last_location');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed.lat === 'number' && typeof parsed.lon === 'number') {
          setCurrentLocation(parsed);
          fetchWeather(parsed.lat, parsed.lon, parsed.name);
          return;
        }
      }
    } catch {}

    fetchWeather(DEFAULT_COORDS.lat, DEFAULT_COORDS.lon, DEFAULT_COORDS.name);
  }, [fetchWeather]);

  // Handle location update
  const setLocation = (lat: number, lon: number, name?: string) => {
    const locName = name || `${lat.toFixed(2)}, ${lon.toFixed(2)}`;
    setCurrentLocation({ lat, lon, name: locName });
    fetchWeather(lat, lon, locName);
    setSearchQuery('');
    setSearchResults([]);
  };

  // Browser Geolocation
  const detectUserLocation = () => {
    if (!navigator.geolocation) {
      alert('Geolocation is not supported by your browser.');
      return;
    }

    setLoading(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        // Try reverse geocoding via API
        try {
          const revRes = await fetch(`/api/geocoding?lat=${lat}&lon=${lon}`);
          if (revRes.ok) {
            const revData = await revRes.json();
            const resolvedName = revData[0]?.name ? `${revData[0].name}, ${revData[0].country}` : 'Current Location';
            setLocation(lat, lon, resolvedName);
            return;
          }
        } catch {}
        setLocation(lat, lon, 'Current Location');
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setLoading(false);
        alert('Could not access your location. Please check browser permissions.');
      },
      { timeout: 10000, enableHighAccuracy: false }
    );
  };

  const refreshWeather = async () => {
    await fetchWeather(currentLocation.lat, currentLocation.lon, currentLocation.name, true);
  };

  // Debounced autocomplete search
  useEffect(() => {
    if (!searchQuery || searchQuery.trim().length < 2) {
      setSearchResults([]);
      return;
    }

    const timer = setTimeout(async () => {
      try {
        setSearching(true);
        const res = await fetch(`/api/geocoding?q=${encodeURIComponent(searchQuery.trim())}`);
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data);
        }
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setSearching(false);
      }
    }, 350);

    return () => clearTimeout(timer);
  }, [searchQuery]);

  return (
    <WeatherContext.Provider
      value={{
        data,
        loading,
        refreshing,
        error,
        currentLocation,
        setLocation,
        detectUserLocation,
        refreshWeather,
        searchQuery,
        setSearchQuery,
        searchResults,
        searching,
        activeMapModal,
        setActiveMapModal,
      }}
    >
      {children}
    </WeatherContext.Provider>
  );
}

export function useWeather() {
  const ctx = useContext(WeatherContext);
  if (!ctx) throw new Error('useWeather must be used within a WeatherProvider');
  return ctx;
}
