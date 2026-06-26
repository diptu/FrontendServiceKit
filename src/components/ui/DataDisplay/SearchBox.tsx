"use client";

import { type InputHTMLAttributes, useRef } from "react";
import { Search, X } from "lucide-react";

export interface SearchBoxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, "onChange" | "value" | "size"> {
  value:        string;
  onChange:     (value: string) => void;
  placeholder?: string;
  className?:   string;
  size?:        "sm" | "md" | "lg";
  fullWidth?:   boolean;
}

const SIZE_MAP = {
  sm: { wrap: "h-7",  input: "pl-7  pr-7  text-xs",   icon: "h-3.5 w-3.5 left-2"  },
  md: { wrap: "h-9",  input: "pl-9  pr-8  text-sm",   icon: "h-4   w-4   left-2.5" },
  lg: { wrap: "h-11", input: "pl-10 pr-9  text-base",  icon: "h-4.5 w-4.5 left-3"  },
} as const;

export function SearchBox({
  value, onChange, placeholder = "Search…",
  className = "", size = "md", fullWidth = false, ...rest
}: SearchBoxProps) {
  const ref = useRef<HTMLInputElement>(null);
  const { wrap, input, icon } = SIZE_MAP[size];

  return (
    <div className={`relative ${wrap} ${fullWidth ? "w-full" : "max-w-sm w-full"} ${className}`}>
      <Search className={`pointer-events-none absolute top-1/2 -translate-y-1/2 text-slate-400 ${icon}`} />
      <input
        ref={ref}
        type="text"
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className={[
          "h-full w-full rounded-lg border border-slate-200 bg-white text-slate-900",
          "placeholder:text-slate-400",
          "focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-400",
          "transition-colors",
          input,
        ].join(" ")}
        {...rest}
      />
      {value && (
        <button
          type="button"
          onClick={() => { onChange(""); ref.current?.focus(); }}
          className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-0.5 text-slate-400 hover:text-slate-700 transition-colors"
          aria-label="Clear search"
        >
          <X className="h-3.5 w-3.5" />
        </button>
      )}
    </div>
  );
}
