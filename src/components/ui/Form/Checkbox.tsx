"use client";

import { useId } from "react";
import { motion, AnimatePresence } from "framer-motion";

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
  sm: { box: "h-3.5 w-3.5 rounded", stroke: 16 },
  md: { box: "h-4   w-4   rounded", stroke: 18 },
} as const;

export function Checkbox({
  checked, onChange, label, description, indeterminate = false,
  disabled = false, size = "md", className = "", id,
}: CheckboxProps) {
  const autoId     = useId();
  const checkboxId = id ?? autoId;
  const { box, stroke } = SIZE_MAP[size];
  const isActive = checked || indeterminate;

  return (
    <div className={`flex items-start gap-2.5 ${className}`}>
      <motion.button
        type="button"
        role="checkbox"
        id={checkboxId}
        aria-checked={indeterminate ? "mixed" : checked}
        disabled={disabled}
        onClick={() => onChange(!checked)}
        whileHover={!disabled ? { scale: 1.1 } : {}}
        whileTap={!disabled ? { scale: 0.88 } : {}}
        animate={{
          backgroundColor: isActive ? "#4f46e5" : "#ffffff",
          borderColor:     isActive ? "#4f46e5" : "#cbd5e1",
        }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={[
          "flex shrink-0 items-center justify-center border-2 relative overflow-hidden",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
          "disabled:opacity-50 disabled:cursor-not-allowed",
          box,
        ].join(" ")}
      >
        <AnimatePresence mode="wait">
          {indeterminate && (
            <motion.svg
              key="minus"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{ type: "spring", stiffness: 600, damping: 20 }}
              viewBox="0 0 12 12"
              width={stroke * 0.75}
              height={stroke * 0.75}
              fill="none"
              className="text-white"
            >
              <line x1="2" y1="6" x2="10" y2="6" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" />
            </motion.svg>
          )}
          {!indeterminate && checked && (
            <motion.svg
              key="check"
              viewBox="0 0 12 12"
              width={stroke * 0.75}
              height={stroke * 0.75}
              fill="none"
              className="text-white"
            >
              <motion.path
                d="M1.5 6L4.5 9L10.5 3"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={{ pathLength: 1, opacity: 1 }}
                exit={{ pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.2, ease: "easeOut" }}
              />
            </motion.svg>
          )}
        </AnimatePresence>
      </motion.button>

      {(label || description) && (
        <label
          htmlFor={checkboxId}
          className={`cursor-pointer select-none ${disabled ? "opacity-50" : ""}`}
        >
          {label && <p className="text-sm font-medium text-slate-800 leading-tight">{label}</p>}
          {description && <p className="mt-0.5 text-xs text-slate-500">{description}</p>}
        </label>
      )}
    </div>
  );
}
