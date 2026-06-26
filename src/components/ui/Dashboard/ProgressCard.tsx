import type { LucideIcon } from "lucide-react";

const TRACK_COLOR = {
  indigo:  "bg-indigo-500",
  emerald: "bg-emerald-500",
  amber:   "bg-amber-500",
  rose:    "bg-rose-500",
  sky:     "bg-sky-500",
  violet:  "bg-violet-500",
} as const;

export type ProgressCardColor = keyof typeof TRACK_COLOR;

export interface ProgressCardProps {
  label:       string;
  value:       number;
  max?:        number;
  sub?:        string;
  color?:      ProgressCardColor;
  icon?:       LucideIcon;
  showPercent?: boolean;
  className?:  string;
}

export function ProgressCard({
  label,
  value,
  max = 100,
  sub,
  color = "indigo",
  icon: Icon,
  showPercent = true,
  className = "",
}: ProgressCardProps) {
  const pct = Math.min(100, Math.max(0, (value / max) * 100));

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="mb-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${TRACK_COLOR[color]} bg-opacity-10`}>
              <Icon className={`h-4 w-4 text-${color}-600`} />
            </div>
          )}
          <p className="text-sm font-semibold text-slate-800">{label}</p>
        </div>
        {showPercent && (
          <span className="text-sm font-bold text-slate-900">{Math.round(pct)}%</span>
        )}
      </div>

      <div className="h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${TRACK_COLOR[color]}`}
          style={{ width: `${pct}%` }}
          role="progressbar"
          aria-valuenow={value}
          aria-valuemin={0}
          aria-valuemax={max}
        />
      </div>

      {sub && <p className="mt-2 text-xs text-slate-400">{sub}</p>}
    </div>
  );
}
