'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type Theme = 'dark' | 'light';

interface ThemeContextType {
  theme: Theme;
  setTheme: (t: Theme) => void;
  toggleTheme: () => void;
  dynamicBg: boolean;
  setDynamicBg: (enabled: boolean) => void;
  toggleDynamicBg: () => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setThemeState] = useState<Theme>('dark');
  const [dynamicBg, setDynamicBgState] = useState<boolean>(true);

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('weatherly_theme') as Theme;
      if (savedTheme === 'light' || savedTheme === 'dark') {
        setThemeState(savedTheme);
      }
      const savedBg = localStorage.getItem('weatherly_dynamic_bg');
      if (savedBg !== null) {
        setDynamicBgState(savedBg === 'true');
      }
    } catch {}
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'light') {
      root.classList.add('light-theme');
      root.classList.remove('dark');
    } else {
      root.classList.remove('light-theme');
      root.classList.add('dark');
    }
    try {
      localStorage.setItem('weatherly_theme', theme);
    } catch {}
  }, [theme]);

  const setTheme = (t: Theme) => setThemeState(t);
  const toggleTheme = () => setThemeState(theme === 'dark' ? 'light' : 'dark');

  const setDynamicBg = (enabled: boolean) => {
    setDynamicBgState(enabled);
    try {
      localStorage.setItem('weatherly_dynamic_bg', enabled ? 'true' : 'false');
    } catch {}
  };

  const toggleDynamicBg = () => setDynamicBg(!dynamicBg);

  return (
    <ThemeContext.Provider
      value={{
        theme,
        setTheme,
        toggleTheme,
        dynamicBg,
        setDynamicBg,
        toggleDynamicBg,
      }}
    >
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error('useTheme must be used within a ThemeProvider');
  return ctx;
}
