"use client";

import { useId } from "react";
import { motion, AnimatePresence } from "framer-motion";

export interface RadioOption {
  value:        string;
  label:        string;
  description?: string;
  disabled?:    boolean;
}

export interface RadioGroupProps {
  options:    RadioOption[];
  value:      string;
  onChange:   (value: string) => void;
  label?:     string;
  name?:      string;
  direction?: "vertical" | "horizontal";
  size?:      "sm" | "md";
  className?: string;
}

const DOT_SIZE = { sm: "h-2 w-2", md: "h-2.5 w-2.5" } as const;
const BOX_SIZE = { sm: "h-3.5 w-3.5", md: "h-4 w-4" }  as const;

export function RadioGroup({
  options, value, onChange, label, name, direction = "vertical", size = "md", className = "",
}: RadioGroupProps) {
  const groupId  = useId();
  const radioName = name ?? groupId;

  return (
    <fieldset className={className}>
      {label && (
        <legend className="mb-2 text-xs font-semibold text-slate-700">{label}</legend>
      )}
      <div className={`flex gap-3 ${direction === "horizontal" ? "flex-row flex-wrap" : "flex-col"}`}>
        {options.map(opt => {
          const selected = opt.value === value;
          const { box, dot } = { box: BOX_SIZE[size], dot: DOT_SIZE[size] };

          return (
            <label
              key={opt.value}
              className={`flex cursor-pointer items-start gap-2.5 select-none ${opt.disabled ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              <motion.button
                type="button"
                role="radio"
                aria-checked={selected}
                disabled={opt.disabled}
                onClick={() => !opt.disabled && onChange(opt.value)}
                whileHover={!opt.disabled ? { scale: 1.08 } : {}}
                whileTap={!opt.disabled ? { scale: 0.9 } : {}}
                animate={{
                  borderColor: selected ? "#4f46e5" : "#cbd5e1",
                }}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
                className={[
                  `mt-0.5 flex shrink-0 items-center justify-center rounded-full border-2 bg-white`,
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
                  "disabled:cursor-not-allowed",
                  box,
                ].join(" ")}
              >
                <AnimatePresence>
                  {selected && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0 }}
                      transition={{ type: "spring", stiffness: 700, damping: 25 }}
                      className={`rounded-full bg-indigo-600 ${dot}`}
                    />
                  )}
                </AnimatePresence>
              </motion.button>

              <div>
                <p className="text-sm font-medium text-slate-800 leading-tight">{opt.label}</p>
                {opt.description && (
                  <p className="mt-0.5 text-xs text-slate-500">{opt.description}</p>
                )}
              </div>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
