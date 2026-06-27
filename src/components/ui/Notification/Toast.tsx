"use client";

import {
  createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode,
} from "react";
import { CheckCircle, AlertTriangle, XCircle, Info, X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Types ──────────────────────────────────────────────────────────────── */
export type ToastVariant = "success" | "error" | "warning" | "info";

export interface ToastItem {
  id:        string;
  variant:   ToastVariant;
  title:     string;
  message?:  string;
  duration?: number;
}

interface ToastContextValue {
  toast: (item: Omit<ToastItem, "id">) => void;
}

/* ── Styles ─────────────────────────────────────────────────────────────── */
const TOAST_STYLES: Record<ToastVariant, { outer: string; icon: string; progress: string; Icon: typeof Info }> = {
  success: { outer: "border-emerald-200 bg-emerald-50", icon: "text-emerald-500", progress: "bg-emerald-400", Icon: CheckCircle   },
  error:   { outer: "border-red-200   bg-red-50",       icon: "text-red-500",     progress: "bg-red-400",     Icon: XCircle       },
  warning: { outer: "border-amber-200 bg-amber-50",     icon: "text-amber-500",   progress: "bg-amber-400",   Icon: AlertTriangle },
  info:    { outer: "border-sky-200   bg-sky-50",       icon: "text-sky-500",     progress: "bg-sky-400",     Icon: Info          },
};

/* ── Context ─────────────────────────────────────────────────────────────── */
const ToastContext = createContext<ToastContextValue>({ toast: () => {} });

export function useToast() {
  return useContext(ToastContext);
}

/* ── Progress bar ────────────────────────────────────────────────────────── */
function ProgressBar({ duration, color }: { duration: number; color: string }) {
  return (
    <motion.div
      className={`absolute bottom-0 left-0 h-0.5 rounded-full ${color}`}
      initial={{ width: "100%" }}
      animate={{ width: "0%" }}
      transition={{ duration: duration / 1000, ease: "linear" }}
    />
  );
}

/* ── Single toast visual ─────────────────────────────────────────────────── */
function ToastCard({ item, onClose }: { item: ToastItem; onClose: () => void }) {
  const { outer, icon, progress, Icon } = TOAST_STYLES[item.variant];
  const duration = item.duration ?? 4000;

  return (
    <motion.div
      layout
      initial={{ opacity: 0, x: 60, scale: 0.92 }}
      animate={{ opacity: 1, x: 0, scale: 1 }}
      exit={{ opacity: 0, x: 60, scale: 0.92, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 400, damping: 30 }}
      className={`relative flex w-80 items-start gap-3 rounded-xl border p-4 shadow-lg overflow-hidden ${outer}`}
    >
      <ProgressBar duration={duration} color={progress} />
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${icon}`} />
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900">{item.title}</p>
        {item.message && <p className="mt-0.5 text-xs text-slate-600">{item.message}</p>}
      </div>
      <motion.button
        type="button"
        onClick={onClose}
        whileHover={{ scale: 1.15, backgroundColor: "rgba(0,0,0,0.08)" }}
        whileTap={{ scale: 0.9 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="shrink-0 rounded p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
        aria-label="Dismiss"
      >
        <X className="h-3.5 w-3.5" />
      </motion.button>
    </motion.div>
  );
}

/* ── ToastProvider ───────────────────────────────────────────────────────── */
export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timers = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const close = useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
    const timer = timers.current.get(id);
    if (timer) { clearTimeout(timer); timers.current.delete(id); }
  }, []);

  const toast = useCallback((item: Omit<ToastItem, "id">) => {
    const id       = `toast-${Date.now()}-${Math.random()}`;
    const duration = item.duration ?? 4000;
    setToasts(prev => [...prev, { ...item, id, duration }]);
    const timer = setTimeout(() => close(id), duration + 300);
    timers.current.set(id, timer);
  }, [close]);

  useEffect(() => {
    const map = timers.current;
    return () => { map.forEach(t => clearTimeout(t)); map.clear(); };
  }, []);

  return (
    <ToastContext.Provider value={{ toast }}>
      {children}
      <div aria-live="polite" className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 items-end">
        <AnimatePresence mode="popLayout">
          {toasts.map(t => (
            <ToastCard key={t.id} item={t} onClose={() => close(t.id)} />
          ))}
        </AnimatePresence>
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
