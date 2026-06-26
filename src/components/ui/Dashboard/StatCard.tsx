import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

/* ── Icon background presets ───────────────────────────────────────────── */
const ICON_BG_PRESETS = {
  indigo:   "bg-indigo-500",
  emerald:  "bg-emerald-500",
  violet:   "bg-violet-500",
  sky:      "bg-sky-500",
  amber:    "bg-amber-500",
  rose:     "bg-rose-500",
  orange:   "bg-orange-500",
  teal:     "bg-teal-500",
  slate:    "bg-slate-500",
} as const;

export type StatCardColor = keyof typeof ICON_BG_PRESETS;

export interface StatCardProps {
  icon:      LucideIcon;
  label:     string;
  value:     string | number;
  trend?:    string;
  trendUp?:  boolean;
  sub?:      string;
  color?:    StatCardColor;
  /** Raw Tailwind bg class — overrides color preset when provided */
  iconBg?:   string;
  loading?:  boolean;
  className?: string;
}

export function StatCard({
  icon: Icon,
  label,
  value,
  trend,
  trendUp,
  sub,
  color = "indigo",
  iconBg,
  loading = false,
  className = "",
}: StatCardProps) {
  const bg = iconBg ?? ICON_BG_PRESETS[color];

  if (loading) {
    return (
      <div className={`flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
        <div className="h-12 w-12 shrink-0 rounded-xl bg-slate-100 animate-pulse" />
        <div className="flex-1 space-y-2">
          <div className="h-3 w-24 rounded bg-slate-100 animate-pulse" />
          <div className="h-6 w-16 rounded bg-slate-100 animate-pulse" />
          <div className="h-2.5 w-20 rounded bg-slate-100 animate-pulse" />
        </div>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${bg}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-slate-900">{value}</p>
        {(trend || sub) && (
          <p
            className={`mt-0.5 flex items-center gap-1 text-[11px] font-medium ${
              trend !== undefined
                ? trendUp ? "text-emerald-600" : "text-red-500"
                : "text-slate-400"
            }`}
          >
            {trend !== undefined && (
              trendUp
                ? <TrendingUp  className="h-3 w-3 shrink-0" />
                : <TrendingDown className="h-3 w-3 shrink-0" />
            )}
            {trend ?? sub}
          </p>
        )}
      </div>
    </div>
  );
}
