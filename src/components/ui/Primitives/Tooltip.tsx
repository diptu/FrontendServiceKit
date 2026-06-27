"use client";

import { useState, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content:    ReactNode;
  children:   ReactNode;
  placement?: TooltipPlacement;
  delay?:     number;
  className?: string;
}

const PLACEMENT_STYLES: Record<TooltipPlacement, string> = {
  top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left:   "right-full top-1/2 -translate-y-1/2 mr-2",
  right:  "left-full top-1/2 -translate-y-1/2 ml-2",
};

const ENTRY_BY_PLACEMENT: Record<TooltipPlacement, { y?: number; x?: number }> = {
  top:    { y:  4 },
  bottom: { y: -4 },
  left:   { x:  4 },
  right:  { x: -4 },
};

export function Tooltip({ content, children, placement = "top", delay = 0, className = "" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  const entry = ENTRY_BY_PLACEMENT[placement];

  return (
    <span
      className="relative inline-flex"
      onMouseEnter={() => setVisible(true)}
      onMouseLeave={() => setVisible(false)}
      onFocus={() => setVisible(true)}
      onBlur={() => setVisible(false)}
    >
      {children}
      <AnimatePresence>
        {visible && (
          <motion.span
            role="tooltip"
            initial={{ opacity: 0, scale: 0.88, ...entry }}
            animate={{ opacity: 1, scale: 1, x: 0, y: 0 }}
            exit={{ opacity: 0, scale: 0.88, transition: { duration: 0.1 } }}
            transition={{ type: "spring", stiffness: 500, damping: 28, delay }}
            className={[
              "pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg",
              PLACEMENT_STYLES[placement],
              className,
            ].join(" ")}
          >
            {content}
          </motion.span>
        )}
      </AnimatePresence>
    </span>
  );
}
