"use client";

import { useId } from "react";
import { Check, Minus } from "lucide-react";

export interface CheckboxProps {
  checked:       boolean;
  onChange:      (checked: boolean) => void;
  label?:        string;
  description?:  string;
  indeterminate?: boolean;
  disabled?:     boolean;
  size?:         "sm" | "md";
  className?:    string;
  id?:           string;
}

const SIZE_MAP = {
  sm: { box: "h-3.5 w-3.5 rounded", icon: "h-2.5 w-2.5" },
  md: { box: "h-4   w-4   rounded", icon: "h-3   w-3"   },
} as const;

export function Checkbox({
  checked, onChange, label, description, indeterminate = false,
  disabled = false, size = "md", className = "", id,
}: CheckboxProps) {
  const autoId     = useId();
  const checkboxId = id ?? autoId;
  const { box, icon } = SIZE_MAP[size];

  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      <button
        type="button"
        role="checkbox"
        id={checkboxId}
        aria-checked={indeterminate ? "mixed" : checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        className={[
          `flex shrink-0 items-center justify-center border-2 transition-colors`,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          box,
          checked || indeterminate
            ? "border-indigo-600 bg-indigo-600"
            : "border-slate-300 bg-white hover:border-indigo-400",
        ].join(" ")}
      >
        {indeterminate && <Minus  className={`${icon} text-white`} strokeWidth={3} />}
        {!indeterminate && checked && <Check className={`${icon} text-white`} strokeWidth={3} />}
      </button>
      {(label || description) && (
        <label htmlFor={checkboxId} className={`cursor-pointer ${disabled ? "opacity-50" : ""}`}>
          {label && <p className="text-sm font-medium text-slate-800 leading-tight">{label}</p>}
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </label>
      )}
    </div>
  );
}
