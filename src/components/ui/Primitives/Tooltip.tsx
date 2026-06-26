"use client";

import { useState, type ReactNode } from "react";

export type TooltipPlacement = "top" | "bottom" | "left" | "right";

export interface TooltipProps {
  content:    ReactNode;
  children:   ReactNode;
  placement?: TooltipPlacement;
  className?: string;
}

const PLACEMENT: Record<TooltipPlacement, string> = {
  top:    "bottom-full left-1/2 -translate-x-1/2 mb-2",
  bottom: "top-full left-1/2 -translate-x-1/2 mt-2",
  left:   "right-full top-1/2 -translate-y-1/2 mr-2",
  right:  "left-full top-1/2 -translate-y-1/2 ml-2",
};

export function Tooltip({ content, children, placement = "top", className = "" }: TooltipProps) {
  const [visible, setVisible] = useState(false);
  return (
    <span className="relative inline-flex" onMouseEnter={() => setVisible(true)} onMouseLeave={() => setVisible(false)} onFocus={() => setVisible(true)} onBlur={() => setVisible(false)}>
      {children}
      <span role="tooltip" className={["pointer-events-none absolute z-50 whitespace-nowrap rounded-lg bg-slate-900 px-2.5 py-1.5 text-xs text-white shadow-lg transition-opacity duration-150", PLACEMENT[placement], visible ? "opacity-100" : "opacity-0", className].join(" ")}>
        {content}
      </span>
    </span>
  );
}
