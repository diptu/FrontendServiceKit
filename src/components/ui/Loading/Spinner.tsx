import type { ReactNode } from "react";

/* ── LoadingSpinner ─────────────────────────────────────────────────────── */
const SPINNER_SIZE = { xs: "h-3 w-3", sm: "h-4 w-4", md: "h-6 w-6", lg: "h-8 w-8", xl: "h-12 w-12" } as const;

export interface SpinnerProps {
  size?:      keyof typeof SPINNER_SIZE;
  className?: string;
}

export function Spinner({ size = "md", className = "" }: SpinnerProps) {
  return (
    <svg
      className={`animate-spin text-indigo-600 ${SPINNER_SIZE[size]} ${className}`}
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      aria-hidden="true"
    >
      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
      <path className="opacity-75" fill="currentColor"
        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
      />
    </svg>
  );
}

/* ── LoadingOverlay ─────────────────────────────────────────────────────── */
export function LoadingOverlay({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="absolute inset-0 z-20 flex flex-col items-center justify-center gap-3 rounded-xl bg-white/80 backdrop-blur-sm">
      <Spinner size="lg" />
      <p className="text-sm font-medium text-slate-500">{label}</p>
    </div>
  );
}

/* ── SkeletonBox (primitive) ───────────────────────────────────────────── */
export function SkeletonBox({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded bg-slate-100 ${className}`} />;
}

/* ── SkeletonText ───────────────────────────────────────────────────────── */
export function SkeletonText({ lines = 1, className = "" }: { lines?: number; className?: string }) {
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {Array.from({ length: lines }).map((_, i) => (
        <SkeletonBox
          key={i}
          className={`h-3 ${i === lines - 1 && lines > 1 ? "w-3/4" : "w-full"}`}
        />
      ))}
    </div>
  );
}

/* ── SkeletonCard ───────────────────────────────────────────────────────── */
export interface SkeletonCardProps {
  rows?:      number;
  showAvatar?: boolean;
  className?: string;
}

export function SkeletonCard({ rows = 3, showAvatar = false, className = "" }: SkeletonCardProps) {
  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      {showAvatar && (
        <div className="mb-4 flex items-center gap-3">
          <SkeletonBox className="h-10 w-10 rounded-full" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-3 w-32" />
            <SkeletonBox className="h-2.5 w-24" />
          </div>
        </div>
      )}
      <div className="space-y-3">
        {Array.from({ length: rows }).map((_, i) => (
          <SkeletonBox key={i} className={`h-3 ${i % 3 === 2 ? "w-2/3" : "w-full"}`} />
        ))}
      </div>
    </div>
  );
}

/* ── SkeletonTable ──────────────────────────────────────────────────────── */
export interface SkeletonTableProps {
  rows?:      number;
  cols?:      number;
  className?: string;
}

export function SkeletonTable({ rows = 5, cols = 4, className = "" }: SkeletonTableProps) {
  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex gap-4 border-b border-slate-100 bg-slate-50 px-5 py-3.5">
        {Array.from({ length: cols }).map((_, i) => (
          <SkeletonBox key={i} className={`h-2.5 ${i === 0 ? "w-24" : "w-16"}`} />
        ))}
      </div>
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="flex items-center gap-4 border-b border-slate-50 px-5 py-3.5">
          {Array.from({ length: cols }).map((_, c) => (
            <SkeletonBox
              key={c}
              className={`h-3 ${c === 0 ? "w-32" : c === cols - 1 ? "w-12" : "w-20"}`}
            />
          ))}
        </div>
      ))}
    </div>
  );
}

/* ── SkeletonStatRow ────────────────────────────────────────────────────── */
export function SkeletonStatRow({ count = 4 }: { count?: number }) {
  return (
    <div className={`grid grid-cols-2 gap-4 sm:grid-cols-${count}`}>
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SkeletonBox className="h-12 w-12 shrink-0 rounded-xl" />
          <div className="flex-1 space-y-2">
            <SkeletonBox className="h-2.5 w-20" />
            <SkeletonBox className="h-5 w-14" />
            <SkeletonBox className="h-2 w-24" />
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── PageLoader ─────────────────────────────────────────────────────────── */
export function PageLoader({ label = "Loading…" }: { label?: string }) {
  return (
    <div className="flex min-h-64 flex-col items-center justify-center gap-4">
      <Spinner size="xl" />
      <p className="text-sm font-medium text-slate-400">{label}</p>
    </div>
  );
}

/* ── ProgressBar ────────────────────────────────────────────────────────── */
export interface ProgressBarProps {
  value:      number;
  max?:       number;
  label?:     string;
  showValue?: boolean;
  color?:     "indigo" | "emerald" | "amber" | "red" | "sky" | "violet";
  size?:      "xs" | "sm" | "md";
  children?:  ReactNode;
}

const BAR_COLOR = {
  indigo:  "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber:   "bg-amber-500",
  red:     "bg-red-500",
  sky:     "bg-sky-500",
  violet:  "bg-violet-500",
} as const;

const BAR_SIZE = { xs: "h-1", sm: "h-1.5", md: "h-2" } as const;

export function ProgressBar({
  value, max = 100, label, showValue = false,
  color = "indigo", size = "sm",
}: ProgressBarProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));
  return (
    <div className="w-full">
      {(label || showValue) && (
        <div className="mb-1 flex items-center justify-between">
          {label    && <span className="text-xs font-medium text-slate-700">{label}</span>}
          {showValue && <span className="text-xs font-medium text-slate-500">{value}/{max}</span>}
        </div>
      )}
      <div className={`w-full rounded-full bg-slate-100 ${BAR_SIZE[size]}`}>
        <div
          className={`rounded-full transition-all ${BAR_COLOR[color]} ${BAR_SIZE[size]}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
