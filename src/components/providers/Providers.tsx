'use client';

import React from 'react';
import { ThemeProvider } from '@/lib/context/ThemeContext';
import { UnitsProvider } from '@/lib/context/UnitsContext';
import { WeatherProvider } from '@/lib/context/WeatherContext';
import { WidgetOrderProvider } from '@/lib/context/WidgetOrderContext';
import { WeatherBackground } from '@/components/background/WeatherBackground';
import { Header } from '@/components/navigation/Header';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider>
      <UnitsProvider>
        <WeatherProvider>
          <WidgetOrderProvider>
            <div className="relative min-h-screen flex flex-col selection:bg-cyan-500 selection:text-white">
              <WeatherBackground />
              <Header />
              <div className="flex-1 pb-16">{children}</div>

              {/* Minimal Footer */}
              <footer className="w-full border-t border-white/10 py-6 text-center text-xs text-slate-400 backdrop-blur-md bg-black/20">
                <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-200">Weatherly</span>
                    <span>•</span>
                    <span>Powered by OpenWeatherMap One Call 3.0 &amp; Tomorrow.io</span>
                  </div>
                  <div className="text-slate-400">
                    High-precision meteorological forecasting engine
                  </div>
                </div>
              </footer>
            </div>
          </WidgetOrderProvider>
        </WeatherProvider>
      </UnitsProvider>
    </ThemeProvider>
  );
}
