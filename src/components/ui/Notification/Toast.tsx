"use client";

import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────────── */
export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id:       string;
  variant:  ToastVariant;
  title:    string;
  message?: string;
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
const TOAST_STYLES: Record<ToastVariant, { outer: string; icon: string; Icon: typeof Info }> = {
  success: { outer: "border-emerald-200 bg-emerald-50", icon: "text-emerald-500", Icon: CheckCircle   },
  error:   { outer: "border-red-200   bg-red-50",       icon: "text-red-500",     Icon: XCircle       },
  warning: { outer: "border-amber-200 bg-amber-50",     icon: "text-amber-500",   Icon: AlertTriangle },
  info:    { outer: "border-sky-200   bg-sky-50",       icon: "text-sky-500",     Icon: Info          },
};

/* ── Context ─────────────────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

/* ── Single toast visual ─────────────────────────────────────────────────── */
function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { outer, icon, Icon } = TOAST_STYLES[item.variant];
  return (
    <div
      className={`flex w-80 items-start gap-3 rounded-xl border p-4 shadow-lg ${outer} animate-in slide-in-from-right-5 duration-200`}
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${icon}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
        {item.message && <p className="mt-0.5 text-xs text-slate-600">{item.message}</p>}
      </div>
      <button
        type="button"
        onClick={onClose}
        className="shrink-0 rounded p-0.5 text-slate-400 hover:bg-black/10 hover:text-slate-700 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ── ToastProvider ───────────────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id = `toast-${Date.now()}-${Math.random()}`;
    setToasts(prev => [...prev, { ...item, id }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  }, []);

  const close = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div
        aria-live="polite"
        className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end"
      >
        {toasts.map(t => (
          <ToastCard key={t.id} item={t} onClose={() => close(t.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/* ── Standalone Toast (preview only — not connected to provider) ───── */
export function ToastPreview({ item }: { item: Omit<ToastItem, "id"> }) {
  const { outer, icon, Icon } = TOAST_STYLES[item.variant];
  return (
    <div className={`flex w-72 items-start gap-3 rounded-xl border p-4 shadow-lg ${outer}`}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${icon}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
        {item.message && <p className="mt-0.5 text-xs text-slate-600">{item.message}</p>}
      </div>
      <X className="h-3.5 w-3.5 shrink-0 text-slate-400" />
    </div>
  );
}
