"use client";

import { useId } from "react";
import { motion } from "framer-motion";

export interface SwitchProps {
  checked:      boolean;
  onChange:     (checked: boolean) => void;
  label?:       string;
  description?: string;
  disabled?:    boolean;
  size?:        "sm" | "md";
  className?:   string;
  id?:          string;
}

const TRACK_SIZE = {
  sm: { track: "h-4 w-7",  thumb: "h-3 w-3",  offX: 2,  onX: 16  },
  md: { track: "h-5 w-9",  thumb: "h-4 w-4",  offX: 2,  onX: 20  },
} as const;

export function Switch({
  checked, onChange, label, description, disabled = false, size = "md", className = "", id,
}: SwitchProps) {
  const autoId   = useId();
  const switchId = id ?? autoId;
  const { track, thumb, offX, onX } = TRACK_SIZE[size];

  return (
    <div className={`flex items-start gap-3 ${className}`}>
      <motion.button
        type="button"
        role="switch"
        id={switchId}
        aria-checked={checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        animate={{ backgroundColor: checked ? "#4f46e5" : "#cbd5e1" }}
        transition={{ duration: 0.2 }}
        whileTap={!disabled ? { scale: 0.92 } : {}}
        className={[
          `relative inline-flex shrink-0 cursor-pointer rounded-full border-2 border-transparent`,
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          track,
        ].join(" ")}
      >
        {/* Glow ring on checked */}
        {checked && (
          <motion.span
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 0.2, scale: 1.5 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 rounded-full bg-indigo-400 pointer-events-none"
            style={{ filter: "blur(4px)" }}
          />
        )}

        {/* Thumb */}
        <motion.span
          layout
          animate={{ x: checked ? onX - 2 : offX - 2 }}
          transition={{ type: "spring", stiffness: 700, damping: 35 }}
          className={[
            "pointer-events-none inline-block rounded-full bg-white shadow-sm ring-0 absolute top-0.5",
            thumb,
          ].join(" ")}
        />
      </motion.button>

      {(label || description) && (
        <label
          htmlFor={switchId}
          className={`cursor-pointer select-none ${disabled ? "opacity-50" : ""}`}
        >
          {label && <p className="text-sm font-medium text-slate-800">{label}</p>}
          {description && <p className="text-xs text-slate-500">{description}</p>}
        </label>
      )}
    </div>
  );
}
