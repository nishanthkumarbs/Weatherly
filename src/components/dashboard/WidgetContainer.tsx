'use client';

import React from 'react';
import { useWidgetOrder } from '@/lib/context/WidgetOrderContext';
import { WidgetId } from '@/lib/types/weather';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { ChevronUp, ChevronDown, EyeOff, GripVertical } from 'lucide-react';

interface WidgetContainerProps {
  id: WidgetId;
  children: React.ReactNode;
}

export function WidgetContainer({ id, children }: WidgetContainerProps) {
  const { widgets, moveWidget, toggleWidget } = useWidgetOrder();

  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const currentIdx = widgets.findIndex((w) => w.id === id);
  const widgetConfig = widgets[currentIdx];

  // If hidden by user preferences, don't render
  if (widgetConfig && !widgetConfig.enabled) {
    return null;
  }

  const isFirst = currentIdx === 0;
  const isLast = currentIdx === widgets.length - 1;

  const style: React.CSSProperties = {
    transform: CSS.Translate.toString(transform),
    transition,
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.7 : undefined,
  };

  return (
    <div ref={setNodeRef} style={style} className="relative group/widget transition-all">
      {/* Reorder & control bar overlay */}
      <div className="absolute top-3 right-3 z-30 opacity-0 group-hover/widget:opacity-100 transition-opacity bg-slate-900/90 backdrop-blur-md border border-white/15 rounded-xl p-1 flex items-center gap-1 shadow-lg">
        {/* Dedicated Drag Handle */}
        <button
          type="button"
          {...attributes}
          {...listeners}
          title="Drag to reorder card"
          className="cursor-grab active:cursor-grabbing p-1 rounded-lg text-slate-400 hover:text-cyan-300 hover:bg-white/10 flex items-center gap-0.5 text-[10px] font-semibold transition-colors"
        >
          <GripVertical className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">Drag</span>
        </button>

        <div className="h-3 w-px bg-white/15 mx-0.5" />

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
