"use client";

import { type InputHTMLAttributes, forwardRef, useId } from "react";

export interface TextFieldProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "size"> {
  label?:       string;
  hint?:        string;
  error?:       string;
  size?:        "sm" | "md" | "lg";
  fullWidth?:   boolean;
  leftAddon?:   string;
  rightAddon?:  string;
}

const SIZE_STYLES = {
  sm: "h-8  px-3 text-xs  rounded-lg",
  md: "h-9  px-3 text-sm  rounded-lg",
  lg: "h-11 px-4 text-base rounded-xl",
} as const;

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, hint, error, size = "md", fullWidth = false, leftAddon, rightAddon, className = "", id, ...props },
    ref
  ) {
    const autoId = useId();
    const fieldId = id ?? autoId;

    return (
      <div className={fullWidth ? "w-full" : "w-full max-w-sm"}>
        {label && (
          <label htmlFor={fieldId} className="mb-1.5 block text-xs font-semibold text-slate-700">
            {label}
          </label>
        )}
        <div className="flex">
          {leftAddon && (
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-3 text-xs text-slate-500">
              {leftAddon}
            </span>
          )}
          <input
            ref={ref}
            id={fieldId}
            className={[
              "w-full border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
              "transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400",
              "disabled:opacity-50 disabled:bg-slate-50",
              error ? "border-red-300 focus:ring-red-500 focus:border-red-400" : "",
              leftAddon  ? "rounded-l-none" : "",
              rightAddon ? "rounded-r-none" : "",
              SIZE_STYLES[size],
              className,
            ].join(" ")}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            aria-invalid={error ? "true" : undefined}
            {...props}
          />
          {rightAddon && (
            <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 px-3 text-xs text-slate-500">
              {rightAddon}
            </span>
          )}
        </div>
        {error && (
          <p id={`${fieldId}-error`} className="mt-1 text-xs text-red-600">{error}</p>
        )}
        {!error && hint && (
          <p id={`${fieldId}-hint`} className="mt-1 text-xs text-slate-400">{hint}</p>
        )}
      </div>
    );
  }
);
