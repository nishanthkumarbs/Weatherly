'use client';

import React from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { useWidgetOrder } from '@/lib/context/WidgetOrderContext';
import { WidgetId } from '@/lib/types/weather';

import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';

import { SevereAlertBanner } from '@/components/alerts/SevereAlertBanner';
import { CurrentHeroCard } from '@/components/forecast/CurrentHeroCard';
import { MinutelyNowcast } from '@/components/forecast/MinutelyNowcast';
import { HourlyForecastChart } from '@/components/forecast/HourlyForecastChart';
import { DailyForecastList } from '@/components/forecast/DailyForecastList';
import { ConditionsGrid } from '@/components/forecast/ConditionsGrid';
import { HistoricalTrends } from '@/components/forecast/HistoricalTrends';
import { AirQualityWidget } from '@/components/airquality/AirQualityWidget';
import { PollenWidget } from '@/components/airquality/PollenWidget';
import { SunMoonTracker } from '@/components/astronomy/SunMoonTracker';
import { ActivityRecommendations } from '@/components/activities/ActivityRecommendations';
import { MapWidgetWrapper } from '@/components/map/MapWidgetWrapper';
import { WidgetContainer } from '@/components/dashboard/WidgetContainer';
import { WidgetCustomizer } from '@/components/dashboard/WidgetCustomizer';
import { WeatherMapModal } from '@/components/map/WeatherMapModal';
import { AlertTriangle, RotateCw } from 'lucide-react';

export function WeatherDashboard() {
  const { data, loading, error, refreshWeather, isOffline, cachedTime } = useWeather();
  const { widgets, reorderWidgets } = useWidgetOrder();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      reorderWidgets(active.id as WidgetId, over.id as WidgetId);
    }
  };

  // Loading skeleton screen
  if (loading && !data) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <div className="h-64 rounded-3xl bg-white/5 border border-white/5 animate-pulse" />
        <div className="grid grid-cols-2 md:grid-cols-6 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-28 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
          ))}
        </div>
        <div className="h-72 rounded-3xl bg-white/5 border border-white/5 animate-pulse" />
      </div>
    );
  }

  // Error fallback screen
  if (error && !data) {
    return (
      <div className="max-w-lg mx-auto px-4 py-24 text-center space-y-4">
        <div className="w-16 h-16 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center justify-center mx-auto">
          <AlertTriangle className="w-8 h-8" />
        </div>
        <h2 className="text-xl font-bold text-white">Weather Data Unavailable</h2>
        <p className="text-sm text-slate-400 leading-relaxed">{error}</p>
        <button
          type="button"
          onClick={() => refreshWeather()}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white text-xs font-bold shadow-lg transition-all"
        >
          <RotateCw className="w-4 h-4" />
          <span>Retry Connection</span>
        </button>
      </div>
    );
  }

  if (!data) return null;

  const renderWidget = (id: WidgetId) => {
    switch (id) {
      case 'severe_alerts':
        return <SevereAlertBanner key={id} />;
      case 'current_hero':
        return (
          <WidgetContainer key={id} id={id}>
            <CurrentHeroCard />
          </WidgetContainer>
        );
      case 'nowcast_minutely':
        return (
          <WidgetContainer key={id} id={id}>
            <MinutelyNowcast />
          </WidgetContainer>
        );
      case 'hourly_forecast':
        return (
          <WidgetContainer key={id} id={id}>
            <HourlyForecastChart />
          </WidgetContainer>
        );
      case 'radar_map':
        return (
          <WidgetContainer key={id} id={id}>
            <MapWidgetWrapper />
          </WidgetContainer>
        );
      case 'daily_forecast':
        return (
          <WidgetContainer key={id} id={id}>
            <DailyForecastList />
          </WidgetContainer>
        );
      case 'conditions_metrics':
        return (
          <WidgetContainer key={id} id={id}>
            <ConditionsGrid />
          </WidgetContainer>
        );
      case 'air_quality':
        return (
          <WidgetContainer key={id} id={id}>
            <AirQualityWidget />
          </WidgetContainer>
        );
      case 'pollen_tracker':
        return (
          <WidgetContainer key={id} id={id}>
            <PollenWidget />
          </WidgetContainer>
        );
      case 'sun_moon':
        return (
          <WidgetContainer key={id} id={id}>
            <SunMoonTracker />
          </WidgetContainer>
        );
      case 'activity_advisor':
        return (
          <WidgetContainer key={id} id={id}>
            <ActivityRecommendations />
          </WidgetContainer>
        );
      case 'historical_trends':
        return (
          <WidgetContainer key={id} id={id}>
            <HistoricalTrends />
          </WidgetContainer>
        );
      default:
        return null;
    }
  };

  return (
    <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      {/* Offline Mode Indicator */}
      {isOffline && (
        <div className="p-3 rounded-2xl bg-amber-500/15 border border-amber-500/30 text-amber-200 text-xs flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            <span>
              <strong>Offline Mode:</strong> Network disconnected. Displaying telemetry cached at{' '}
              {cachedTime || 'recently'}.
            </span>
          </div>
          <button
            type="button"
            onClick={() => refreshWeather()}
            className="px-2.5 py-1 rounded-lg bg-amber-500/20 hover:bg-amber-500/30 text-amber-200 font-semibold transition-colors"
          >
            Reconnect
          </button>
        </div>
      )}

      {/* Drag and Drop Sortable Widgets Feed */}
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={widgets.map((w) => w.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-6">{widgets.map((widget) => renderWidget(widget.id))}</div>
        </SortableContext>
      </DndContext>

      {/* Fullscreen Radar Modal */}
      <WeatherMapModal />

      {/* Floating Customizer Drawer Button */}
      <WidgetCustomizer />
    </main>
  );
}
