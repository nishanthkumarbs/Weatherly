'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { WidgetId, WidgetConfig } from '@/lib/types/weather';
import { arrayMove } from '@dnd-kit/sortable';

interface WidgetOrderContextType {
  widgets: WidgetConfig[];
  moveWidget: (id: WidgetId, direction: 'up' | 'down') => void;
  reorderWidgets: (activeId: WidgetId, overId: WidgetId) => void;
  toggleWidget: (id: WidgetId) => void;
  resetOrder: () => void;
  isCustomized: boolean;
}

const DEFAULT_WIDGETS: WidgetConfig[] = [
  { id: 'severe_alerts', label: 'Severe Weather Alerts', enabled: true },
  { id: 'current_hero', label: 'Current Weather & Hero', enabled: true },
  { id: 'nowcast_minutely', label: '60-Minute Precipitation Nowcast', enabled: true },
  { id: 'hourly_forecast', label: '48-Hour Hourly Outlook & Multi-Model', enabled: true },
  { id: 'radar_map', label: 'Interactive Radar & Satellite Loop', enabled: true },
  { id: 'daily_forecast', label: '7-Day Extended Forecast', enabled: true },
  { id: 'conditions_metrics', label: 'Detailed Atmospheric Metrics', enabled: true },
  { id: 'air_quality', label: 'Air Quality Index (AQI)', enabled: true },
  { id: 'pollen_tracker', label: 'Pollen Levels & Allergens', enabled: true },
  { id: 'sun_moon', label: 'Sun & Moon Phase Astronomy', enabled: true },
  { id: 'activity_advisor', label: 'Outdoor Activity Advisor', enabled: true },
  { id: 'historical_trends', label: 'Historical Trends & Normals', enabled: true },
];

const WidgetOrderContext = createContext<WidgetOrderContextType | undefined>(undefined);

export function WidgetOrderProvider({ children }: { children: React.ReactNode }) {
  const [widgets, setWidgets] = useState<WidgetConfig[]>(DEFAULT_WIDGETS);
  const [isCustomized, setIsCustomized] = useState<boolean>(false);

  useEffect(() => {
    try {
      const saved = localStorage.getItem('weatherly_widgets_config');
      if (saved) {
        const parsed: WidgetConfig[] = JSON.parse(saved);
        const existingIds = new Set(parsed.map((w) => w.id));
        const merged = [
          ...parsed,
          ...DEFAULT_WIDGETS.filter((w) => !existingIds.has(w.id)),
        ];
        setWidgets(merged);
        setIsCustomized(true);
      }
    } catch {}
  }, []);

  const saveConfig = (newWidgets: WidgetConfig[]) => {
    setWidgets(newWidgets);
    setIsCustomized(true);
    try {
      localStorage.setItem('weatherly_widgets_config', JSON.stringify(newWidgets));
    } catch {}
  };

  const moveWidget = (id: WidgetId, direction: 'up' | 'down') => {
    const index = widgets.findIndex((w) => w.id === id);
    if (index === -1) return;
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= widgets.length) return;

    const updated = arrayMove(widgets, index, targetIndex);
    saveConfig(updated);
  };

  const reorderWidgets = (activeId: WidgetId, overId: WidgetId) => {
    const oldIndex = widgets.findIndex((w) => w.id === activeId);
    const newIndex = widgets.findIndex((w) => w.id === overId);
    if (oldIndex !== -1 && newIndex !== -1 && oldIndex !== newIndex) {
      const updated = arrayMove(widgets, oldIndex, newIndex);
      saveConfig(updated);
    }
  };

  const toggleWidget = (id: WidgetId) => {
    const updated = widgets.map((w) => (w.id === id ? { ...w, enabled: !w.enabled } : w));
    saveConfig(updated);
  };

  const resetOrder = () => {
    setWidgets(DEFAULT_WIDGETS);
    setIsCustomized(false);
    try {
      localStorage.removeItem('weatherly_widgets_config');
    } catch {}
  };

  return (
    <WidgetOrderContext.Provider
      value={{
        widgets,
        moveWidget,
        reorderWidgets,
        toggleWidget,
        resetOrder,
        isCustomized,
      }}
    >
      {children}
    </WidgetOrderContext.Provider>
  );
}

export function useWidgetOrder() {
  const ctx = useContext(WidgetOrderContext);
  if (!ctx) throw new Error('useWidgetOrder must be used within a WidgetOrderProvider');
  return ctx;
}
