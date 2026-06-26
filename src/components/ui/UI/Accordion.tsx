"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

export interface AccordionItem {
  key:      string;
  title:    ReactNode;
  content:  ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items:      AccordionItem[];
  multiple?:  boolean;
  defaultOpen?: string[];
  className?: string;
}

export function Accordion({
  items, multiple = false, defaultOpen = [], className = "",
}: AccordionProps) {
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpen));

  function toggle(key: string) {
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(key)) {
        next.delete(key);
      } else {
        if (!multiple) next.clear();
        next.add(key);
      }
      return next;
    });
  }

  return (
    <div className={`divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white ${className}`}>
      {items.map(item => {
        const isOpen = open.has(item.key);
        return (
          <div key={item.key}>
            <button
              type="button"
              disabled={item.disabled}
              onClick={() => toggle(item.key)}
              className={[
                "flex w-full items-center justify-between gap-4 px-5 py-4 text-left transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isOpen ? "text-indigo-700" : "text-slate-800 hover:bg-slate-50",
              ].join(" ")}
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold">{item.title}</span>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
              />
            </button>
            {isOpen && (
              <div className="px-5 pb-4 text-sm text-slate-600 leading-relaxed">
                {item.content}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
