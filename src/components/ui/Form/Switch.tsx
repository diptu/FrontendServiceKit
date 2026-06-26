"use client";

import { useId } from "react";

export interface SwitchProps {
  checked:    boolean;
  onChange:   (checked: boolean) => void;
  label?:     string;
  description?: string;
  disabled?:  boolean;
  size?:      "sm" | "md";
  className?: string;
  id?:        string;
}

const TRACK_SIZE = {
  sm: { track: "h-4 w-7",  thumb: "h-3 w-3", translate: "translate-x-3" },
  md: { track: "h-5 w-9",  thumb: "h-4 w-4", translate: "translate-x-4" },
} as const;

export function Switch({
  checked, onChange, label, description, disabled = false, size = "md", className = "", id,
}: SwitchProps) {
  const autoId  = useId();
  const switchId = id ?? autoId;
  const { track, thumb, translate } = TRACK_SIZE[size];

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          `relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out`,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          track,
          checked ? "bg-indigo-600" : "bg-slate-200",
        ].join(" ")}
      >
        <span
          className={[
            "pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 transition-transform duration-200 ease-in-out",
            thumb,
            checked ? translate : "translate-x-0",
          ].join(" ")}
        />
      </button>
      {(label || description) && (
        <label htmlFor={switchId} className={`cursor-pointer ${disabled ? "opacity-50" : ""}`}>
          {label && <p className="text-sm font-medium text-slate-800">{label}</p>}
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </label>
      )}
    </div>
  );
}
