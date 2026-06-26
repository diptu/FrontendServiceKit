import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown, Minus } from "lucide-react";

export interface MetricCardProps {
  label:      string;
  value:      string | number;
  previous?:  string | number;
  change?:    number;
  unit?:      string;
  icon?:      LucideIcon;
  className?: string;
}

export function MetricCard({
  label,
  value,
  previous,
  change,
  unit,
  icon: Icon,
  className = "",
}: MetricCardProps) {
  const isPositive = change !== undefined && change > 0;
  const isNegative = change !== undefined && change < 0;
  const isFlat     = change !== undefined && change === 0;

  return (
    <div className={`rounded-xl border border-slate-200 bg-white p-5 shadow-sm ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-400">{label}</p>
          <p className="mt-1.5 text-2xl font-bold text-slate-900">
            {value}
            {unit && <span className="ml-1 text-sm font-normal text-slate-400">{unit}</span>}
          </p>
          {change !== undefined && (
            <div className={`mt-1.5 flex items-center gap-1 text-xs font-semibold ${
              isPositive ? "text-emerald-600"
              : isNegative ? "text-red-500"
              : "text-slate-400"
            }`}>
              {isPositive && <TrendingUp  className="h-3 w-3" />}
              {isNegative && <TrendingDown className="h-3 w-3" />}
              {isFlat     && <Minus        className="h-3 w-3" />}
              <span>
                {isPositive ? "+" : ""}{change}%
                {previous !== undefined && (
                  <span className="ml-1 font-normal text-slate-400">vs {previous}</span>
                )}
              </span>
            </div>
          )}
        </div>
        {Icon && (
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-indigo-50">
            <Icon className="h-5 w-5 text-indigo-600" />
          </div>
        )}
      </div>
    </div>
  );
}
