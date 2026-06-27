"use client";

import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface AccordionItem {
  key:       string;
  title:     ReactNode;
  content:   ReactNode;
  disabled?: boolean;
}

export interface AccordionProps {
  items:        AccordionItem[];
  multiple?:    boolean;
  defaultOpen?: string[];
  variant?:     "bordered" | "separated";
  className?:   string;
}

export function Accordion({ items, multiple = false, defaultOpen = [], variant = "bordered", className = "" }: AccordionProps) {
  const [open, setOpen] = useState<Set<string>>(new Set(defaultOpen));

  function toggle(key: string) {
    setOpen(prev => {
      const next = new Set(prev);
      if (next.has(key)) { next.delete(key); }
      else { if (!multiple) next.clear(); next.add(key); }
      return next;
    });
  }

  return (
    <div
      className={[
        variant === "bordered"
          ? "divide-y divide-slate-100 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden"
          : "flex flex-col gap-2",
        className,
      ].join(" ")}
    >
      {items.map(item => {
        const isOpen = open.has(item.key);
        return (
          <div
            key={item.key}
            className={variant === "separated" ? "rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden" : ""}
          >
            <motion.button
              type="button"
              disabled={item.disabled}
              onClick={() => toggle(item.key)}
              whileTap={!item.disabled ? { scale: 0.998 } : {}}
              whileHover={!item.disabled ? { backgroundColor: "#f8fafc" } : {}}
              className={[
                "flex w-full items-center justify-between gap-4 px-5 py-4 text-left",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-indigo-500",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                isOpen ? "text-indigo-700" : "text-slate-800",
              ].join(" ")}
              aria-expanded={isOpen}
            >
              <span className="text-sm font-semibold">{item.title}</span>
              <motion.span
                animate={{ rotate: isOpen ? 180 : 0 }}
                transition={{ type: "spring", stiffness: 400, damping: 28 }}
                className="shrink-0"
              >
                <ChevronDown className={`h-4 w-4 ${isOpen ? "text-indigo-500" : "text-slate-400"}`} />
              </motion.span>
            </motion.button>

            <AnimatePresence initial={false}>
              {isOpen && (
                <motion.div
                  key="content"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: "hidden" }}
                >
                  <div className="px-5 pb-5 pt-0 text-sm text-slate-600 leading-relaxed">
                    {item.content}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        );
      })}
    </div>
  );
}
