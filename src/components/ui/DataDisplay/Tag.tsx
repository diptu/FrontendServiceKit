import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { X } from "lucide-react";

export interface TagProps {
  children:   ReactNode;
  icon?:      LucideIcon;
  onRemove?:  () => void;
  variant?:   "default" | "info" | "success" | "warning" | "error" | "muted";
  size?:      "sm" | "md";
  className?: string;
}

const VARIANT_STYLES = {
  default: "bg-indigo-50  text-indigo-700  border-indigo-200",
  info:    "bg-sky-50     text-sky-700     border-sky-200",
  success: "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning: "bg-amber-50   text-amber-700   border-amber-200",
  error:   "bg-red-50     text-red-700     border-red-200",
  muted:   "bg-slate-100  text-slate-600   border-slate-200",
} as const;

export function Tag({
  children,
  icon: Icon,
  onRemove,
  variant = "default",
  size = "sm",
  className = "",
}: TagProps) {
  return (
    <span
      className={[
        "inline-flex items-center gap-1 rounded-md border font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-2.5 py-1 text-sm",
        VARIANT_STYLES[variant],
        className,
      ].join(" ")}
    >
      {Icon && <Icon className={size === "sm" ? "h-3 w-3" : "h-3.5 w-3.5"} />}
      {children}
      {onRemove && (
        <button
          type="button"
          onClick={onRemove}
          className="ml-0.5 rounded hover:bg-black/10 p-0.5 transition-colors"
          aria-label="Remove"
        >
          <X className={size === "sm" ? "h-2.5 w-2.5" : "h-3 w-3"} />
        </button>
      )}
    </span>
  );
}
