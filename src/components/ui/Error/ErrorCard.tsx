import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { AlertTriangle } from "lucide-react";

export interface ErrorCardProps {
  title?:       string;
  message?:     string;
  icon?:        LucideIcon;
  action?:      ReactNode;
  compact?:     boolean;
  className?:   string;
}

export function ErrorCard({
  title = "Something went wrong",
  message,
  icon: Icon = AlertTriangle,
  action,
  compact = false,
  className = "",
}: ErrorCardProps) {
  return (
    <div
      className={[
        "flex flex-col items-center justify-center text-center rounded-xl border border-red-100 bg-red-50",
        compact ? "p-6" : "p-10",
        className,
      ].join(" ")}
    >
      <div className={`flex items-center justify-center rounded-full bg-red-100 ${compact ? "h-10 w-10 mb-3" : "h-14 w-14 mb-4"}`}>
        <Icon className={`text-red-500 ${compact ? "h-5 w-5" : "h-6 w-6"}`} />
      </div>
      <p className={`font-bold text-red-800 ${compact ? "text-sm" : "text-base"}`}>{title}</p>
      {message && (
        <p className={`mt-1.5 text-red-600 ${compact ? "text-xs" : "text-sm"} max-w-xs`}>{message}</p>
      )}
      {action && <div className="mt-4">{action}</div>}
    </div>
  );
}
