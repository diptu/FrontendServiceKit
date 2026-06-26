import type { LucideIcon } from "lucide-react";
import type { ReactNode } from "react";

export interface EmptyStateProps {
  icon?:        LucideIcon;
  title:        string;
  description?: string;
  action?:      ReactNode;
  compact?:     boolean;
  className?:   string;
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
  compact = false,
  className = "",
}: EmptyStateProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center",
        compact ? "py-8 px-4" : "py-16 px-6",
        className,
      ].join(" ")}
    >
      {Icon && (
        <div className={`flex items-center justify-center rounded-full bg-slate-100 ${compact ? "h-10 w-10" : "h-14 w-14"} mb-4`}>
          <Icon className={`${compact ? "h-5 w-5" : "h-6 w-6"} text-slate-400`} />
        </div>
      )}
      <p className={`font-semibold text-slate-700 ${compact ? "text-sm" : "text-base"}`}>{title}</p>
      {description && (
        <p className={`mt-1 text-slate-400 ${compact ? "text-xs" : "text-sm"} max-w-xs`}>{description}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
