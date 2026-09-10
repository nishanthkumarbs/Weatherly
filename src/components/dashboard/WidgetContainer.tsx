'use client';

import React from 'react';
import { useWidgetOrder } from '@/lib/context/WidgetOrderContext';
import { WidgetId } from '@/lib/types/weather';
import { ChevronUp, ChevronDown, EyeOff, GripVertical } from 'lucide-react';

interface WidgetContainerProps {
  id: WidgetId;
  children: React.ReactNode;
}

export function WidgetContainer({ id, children }: WidgetContainerProps) {
  const { widgets, moveWidget, toggleWidget } = useWidgetOrder();

  const currentIdx = widgets.findIndex((w) => w.id === id);
  const widgetConfig = widgets[currentIdx];

  // If hidden by user preferences, don't render
  if (widgetConfig && !widgetConfig.enabled) {
    return null;
  }

  const isFirst = currentIdx === 0;
  const isLast = currentIdx === widgets.length - 1;

  return (
    <div className="relative group/widget transition-all">
      {/* Reorder & control bar overlay (appears smoothly on hover/focus) */}
      <div className="absolute top-3 right-3 z-30 opacity-0 group-hover/widget:opacity-100 transition-opacity bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-xl p-1 flex items-center gap-1 shadow-lg">
        <span className="text-[10px] font-semibold text-slate-400 px-1 hidden sm:inline flex items-center gap-0.5">
          <GripVertical className="w-3 h-3 text-slate-500" />
          Widget
        </span>
        
        <button
          type="button"
          onClick={() => moveWidget(id, 'up')}
          disabled={isFirst}
          title="Move widget up"
          className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => moveWidget(id, 'down')}
          disabled={isLast}
          title="Move widget down"
          className="p-1 rounded-lg text-slate-300 hover:text-white hover:bg-white/10 disabled:opacity-30 disabled:hover:bg-transparent"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>

        <button
          type="button"
          onClick={() => toggleWidget(id)}
          title="Hide this widget"
          className="p-1 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-white/10"
        >
          <EyeOff className="w-3.5 h-3.5" />
        </button>
      </div>

      {children}
    </div>
  );
}
