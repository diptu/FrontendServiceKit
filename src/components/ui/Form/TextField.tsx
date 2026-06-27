"use client";

import { type InputHTMLAttributes, forwardRef, useId, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

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

const shakeVariants = {
  shake: {
    x: [0, -6, 6, -4, 4, -2, 2, 0],
    transition: { duration: 0.4 },
  },
  still: { x: 0 },
};

export const TextField = forwardRef<HTMLInputElement, TextFieldProps>(
  function TextField(
    { label, hint, error, size = "md", fullWidth = false, leftAddon, rightAddon, className = "", id, onFocus, onBlur, ...props },
    ref
  ) {
    const autoId  = useId();
    const fieldId = id ?? autoId;
    const [focused, setFocused] = useState(false);

    return (
      <div className={fullWidth ? "w-full" : "w-full max-w-sm"}>
        {label && (
          <motion.label
            htmlFor={fieldId}
            animate={{ color: focused ? "#4f46e5" : "#374151" }}
            transition={{ duration: 0.15 }}
            className="mb-1.5 block text-xs font-semibold"
          >
            {label}
          </motion.label>
        )}
        <motion.div
          className="flex"
          animate={error ? "shake" : "still"}
          variants={shakeVariants}
        >
          {leftAddon && (
            <span className="inline-flex items-center rounded-l-lg border border-r-0 border-slate-200 bg-slate-50 px-3 text-xs text-slate-500">
              {leftAddon}
            </span>
          )}
          <motion.input
            ref={ref}
            id={fieldId}
            animate={{
              borderColor: error ? "#fca5a5" : focused ? "#6366f1" : "#e2e8f0",
              boxShadow:   focused && !error ? "0 0 0 3px rgba(99,102,241,0.15)" : "none",
            }}
            transition={{ duration: 0.15 }}
            onFocus={e => { setFocused(true); onFocus?.(e); }}
            onBlur={e  => { setFocused(false); onBlur?.(e); }}
            className={[
              "w-full border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400",
              "focus:outline-none",
              "disabled:opacity-50 disabled:bg-slate-50",
              leftAddon  ? "rounded-l-none" : "",
              rightAddon ? "rounded-r-none" : "",
              SIZE_STYLES[size],
              className,
            ].join(" ")}
            aria-describedby={error ? `${fieldId}-error` : hint ? `${fieldId}-hint` : undefined}
            aria-invalid={error ? "true" : undefined}
            {...(props as React.ComponentPropsWithoutRef<typeof motion.input>)}
          />
          {rightAddon && (
            <span className="inline-flex items-center rounded-r-lg border border-l-0 border-slate-200 bg-slate-50 px-3 text-xs text-slate-500">
              {rightAddon}
            </span>
          )}
        </motion.div>
        <AnimatePresence mode="wait">
          {error ? (
            <motion.p
              key="error"
              id={`${fieldId}-error`}
              initial={{ opacity: 0, y: -4, height: 0 }}
              animate={{ opacity: 1, y: 0, height: "auto" }}
              exit={{ opacity: 0, y: -4, height: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 text-xs text-red-600"
            >
              {error}
            </motion.p>
          ) : hint ? (
            <motion.p
              key="hint"
              id={`${fieldId}-hint`}
              initial={{ opacity: 0, y: -4 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className="mt-1 text-xs text-slate-400"
            >
              {hint}
            </motion.p>
          ) : null}
        </AnimatePresence>
      </div>
    );
  }
);
