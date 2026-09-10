'use client';

import React, { useState } from 'react';
import { useWidgetOrder } from '@/lib/context/WidgetOrderContext';
import { SlidersHorizontal, Check, RotateCcw, X, Eye, EyeOff, ArrowUp, ArrowDown } from 'lucide-react';

export function WidgetCustomizer() {
  const [isOpen, setIsOpen] = useState(false);
  const { widgets, moveWidget, toggleWidget, resetOrder, isCustomized } = useWidgetOrder();

  return (
    <>
      {/* Floating Customizer Button */}
      <button
        type="button"
        id="customize-widgets-btn"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-40 flex items-center gap-2 px-4 py-2.5 rounded-full bg-slate-900/90 hover:bg-slate-800 text-white border border-white/20 shadow-2xl backdrop-blur-xl transition-all hover:scale-105"
      >
        <SlidersHorizontal className="w-4 h-4 text-cyan-400" />
        <span className="text-xs font-bold">Customize Dashboard</span>
        {isCustomized && (
          <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
        )}
      </button>

      {/* Modal Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
          <div className="w-full max-w-lg bg-slate-900 border border-white/15 rounded-3xl p-6 shadow-2xl space-y-5 max-h-[85vh] flex flex-col">
            
            <div className="flex items-center justify-between pb-3 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <SlidersHorizontal className="w-5 h-5 text-cyan-400" />
                <div>
                  <h3 className="font-bold text-base text-white">Reorder &amp; Toggle Widgets</h3>
                  <p className="text-xs text-slate-400">Tailor your personal weather dashboard</p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-slate-400 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Widget List */}
            <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
              {widgets.map((w, index) => (
                <div
                  key={w.id}
                  className={`p-3 rounded-2xl border flex items-center justify-between gap-3 transition-colors ${
                    w.enabled
                      ? 'bg-white/5 border-white/10 text-white'
                      : 'bg-black/40 border-white/5 text-slate-500 opacity-60'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <button
                      type="button"
                      onClick={() => toggleWidget(w.id)}
                      className={`p-1.5 rounded-lg border transition-colors ${
                        w.enabled
                          ? 'bg-cyan-500/20 border-cyan-500/40 text-cyan-300'
                          : 'bg-white/5 border-white/10 text-slate-500'
                      }`}
                    >
                      {w.enabled ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                    </button>
                    <span className="text-xs font-semibold">{w.label}</span>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => moveWidget(w.id, 'up')}
                      disabled={index === 0}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowUp className="w-3.5 h-3.5" />
                    </button>
                    <button
                      type="button"
                      onClick={() => moveWidget(w.id, 'down')}
                      disabled={index === widgets.length - 1}
                      className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white disabled:opacity-20"
                    >
                      <ArrowDown className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="pt-3 border-t border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={resetOrder}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Default</span>
              </button>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-5 py-2 rounded-xl bg-cyan-500 hover:bg-cyan-400 text-white font-bold text-xs shadow-lg shadow-cyan-500/25 transition-all"
              >
                Done
              </button>
            </div>

          </div>
        </div>
      )}
    </>
  );
}
