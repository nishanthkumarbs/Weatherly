'use client';

import React, { useState } from 'react';
import { useWeather } from '@/lib/context/WeatherContext';
import { AlertTriangle, ChevronDown, ChevronUp, X, ShieldAlert } from 'lucide-react';

export function SevereAlertBanner() {
  const { data } = useWeather();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  if (!data || !data.alerts || data.alerts.length === 0) return null;

  const activeAlerts = data.alerts.filter((a) => !dismissedIds.has(a.id));
  if (activeAlerts.length === 0) return null;

  const toggleExpand = (id: string) => {
    setExpandedId(expandedId === id ? null : id);
  };

  const dismissAlert = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setDismissedIds(new Set([...dismissedIds, id]));
  };

  return (
    <div className="space-y-2 mb-6">
      {activeAlerts.map((alert) => {
        const isExpanded = expandedId === alert.id;
        const isWarning = alert.severity === 'warning';
        const isWatch = alert.severity === 'watch';

        const colorClasses = isWarning
          ? 'bg-rose-950/70 border-rose-500/50 text-rose-200'
          : isWatch
          ? 'bg-amber-950/70 border-amber-500/50 text-amber-200'
          : 'bg-yellow-950/70 border-yellow-500/50 text-yellow-200';

        const badgeClasses = isWarning
          ? 'bg-rose-500 text-white'
          : isWatch
          ? 'bg-amber-500 text-slate-950'
          : 'bg-yellow-500 text-slate-950';

        return (
          <div
            key={alert.id}
            className={`rounded-2xl border backdrop-blur-xl p-4 transition-all shadow-xl cursor-pointer ${colorClasses}`}
            onClick={() => toggleExpand(alert.id)}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-white/10 flex-shrink-0 animate-pulse">
                  <ShieldAlert className="w-5 h-5 text-current" />
                </div>
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-[10px] uppercase font-black px-2 py-0.5 rounded-full ${badgeClasses}`}>
                      {alert.severity}
                    </span>
                    <h4 className="font-bold text-sm tracking-tight text-white">{alert.event}</h4>
                  </div>
                  <p className="text-xs text-slate-300 mt-0.5 line-clamp-1">{alert.headline}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                <button
                  type="button"
                  onClick={(e) => dismissAlert(alert.id, e)}
                  title="Dismiss alert"
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Expandable full advisory text */}
            {isExpanded && (
              <div className="mt-3 pt-3 border-t border-white/10 text-xs text-slate-200 space-y-2">
                <p className="leading-relaxed whitespace-pre-line">{alert.description}</p>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                  <span>Issued by: {alert.senderName}</span>
                  <span>
                    Valid until: {new Date(alert.end * 1000).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
