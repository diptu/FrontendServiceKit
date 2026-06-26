"use client";

import { type SelectHTMLAttributes, forwardRef, useId } from "react";
import { ChevronDown } from "lucide-react";

export interface SelectOption {
  value:    string;
  label:    string;
  disabled?: boolean;
}

export interface SelectProps extends Omit<SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  label?:       string;
  hint?:        string;
  error?:       string;
  options?:     SelectOption[];
  placeholder?: string;
  size?:        "sm" | "md" | "lg";
  fullWidth?:   boolean;
}

const SIZE_STYLES = {
  sm: "h-8  pl-3 pr-8 text-xs  rounded-lg",
  md: "h-9  pl-3 pr-9 text-sm  rounded-lg",
  lg: "h-11 pl-4 pr-10 text-base rounded-xl",
} as const;

const CHEVRON_SIZE = { sm: "h-3 w-3 right-2", md: "h-3.5 w-3.5 right-2.5", lg: "h-4 w-4 right-3" } as const;

export const Select = forwardRef<HTMLSelectElement, SelectProps>(
  function Select(
    { label, hint, error, options, placeholder, size = "md", fullWidth = false, className = "", id, children, ...props },
    ref
  ) {
    const autoId  = useId();
    const fieldId = id ?? autoId;

    return (
      <div className={fullWidth ? "w-full" : "w-full max-w-sm"}>
        {label && (
          <label htmlFor={fieldId} className="mb-1.5 block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="relative">
          <select
            ref={ref}
            id={fieldId}
            className={[
              "w-full appearance-none border border-slate-200 bg-white text-slate-900",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400",
              "disabled:opacity-50 disabled:bg-slate-50",
              error ? "border-red-300 focus:ring-red-500 focus:border-red-400" : "",
              SIZE_STYLES[size],
              className,
            ].join(" ")}
            aria-invalid={error ? "true" : undefined}
            {...props}
          >
            {placeholder && <option value="" disabled>{placeholder}</option>}
            {options
              ? options.map(opt => (
                  <option key={opt.value} value={opt.value} disabled={opt.disabled}>
                    {opt.label}
                  </option>
                ))
              : children}
          </select>
          <ChevronDown
            className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${CHEVRON_SIZE[size]}`}
          />
        </div>
        {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
        {!error && hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
      </div>
    );
  }
);
