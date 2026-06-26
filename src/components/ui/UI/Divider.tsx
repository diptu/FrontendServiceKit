import type { ReactNode } from "react";

export interface DividerProps {
  label?:      ReactNode;
  orientation?: "horizontal" | "vertical";
  className?:  string;
}

export function Divider({ label, orientation = "horizontal", className = "" }: DividerProps) {
  if (orientation === "vertical") {
    return (
      <div className={`mx-2 self-stretch w-px bg-slate-200 ${className}`} role="separator" aria-orientation="vertical" />
    );
  }

  if (label) {
    return (
      <div className={`flex items-center gap-3 ${className}`} role="separator">
        <div className="h-px flex-1 bg-slate-200" />
        <span className="shrink-0 text-xs font-medium text-slate-400">{label}</span>
        <div className="h-px flex-1 bg-slate-200" />
      </div>
    );
  }

  return <div className={`h-px w-full bg-slate-200 ${className}`} role="separator" />;
}
