"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Check, MoreVertical } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

export interface MenuItem {
  key:        string;
  label:      string;
  icon?:      LucideIcon;
  variant?:   "default" | "danger";
  disabled?:  boolean;
  checked?:   boolean;
  separator?: boolean;
}

export interface DropdownMenuProps {
  trigger:    ReactNode;
  items:      MenuItem[];
  onSelect?:  (key: string) => void;
  align?:     "left" | "right";
  className?: string;
}

const menuVariants = {
  hidden: { opacity: 0, scale: 0.94, y: -6 },
  show: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: {
      duration: 0.18,
      ease: "easeOut",
      staggerChildren: 0.04,
      delayChildren: 0.04,
    },
  },
  exit: {
    opacity: 0,
    scale: 0.94,
    y: -4,
    transition: { duration: 0.13, ease: "easeIn" },
  },
} as const;

const itemVariants = {
  hidden: { opacity: 0, x: -6 },
  show:   { opacity: 1, x: 0, transition: { duration: 0.15 } },
};

export function DropdownMenu({
  trigger, items, onSelect, align = "right", className = "",
}: DropdownMenuProps) {
  const [open, setOpen] = useState(false);
  const ref             = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    function handler(e: MouseEvent | KeyboardEvent) {
      if ((e as KeyboardEvent).key === "Escape") { setOpen(false); return; }
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handler);
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("mousedown", handler);
      document.removeEventListener("keydown", handler);
    };
  }, [open]);

  return (
    <div ref={ref} className={`relative inline-block ${className}`}>
      <motion.div
        onClick={() => setOpen(prev => !prev)}
        whileTap={{ scale: 0.96 }}
      >
        {trigger}
      </motion.div>

      <AnimatePresence>
        {open && (
          <motion.div
            variants={menuVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            className={[
              "absolute z-50 mt-1.5 w-48 rounded-xl border border-slate-100 bg-white py-1 shadow-lg origin-top",
              align === "right" ? "right-0" : "left-0",
            ].join(" ")}
            role="menu"
          >
            {items.map((item, i) => {
              if (item.separator) {
                return (
                  <motion.div key={`sep-${i}`} variants={itemVariants} className="my-1 border-t border-slate-100" />
                );
              }
              const Icon   = item.icon;
              const danger = item.variant === "danger";
              return (
                <motion.button
                  key={item.key}
                  variants={itemVariants}
                  type="button"
                  role="menuitem"
                  disabled={item.disabled}
                  whileHover={!item.disabled ? { x: 2, backgroundColor: danger ? "#fff1f2" : "#f8fafc" } : {}}
                  onClick={() => { if (item.disabled) return; setOpen(false); onSelect?.(item.key); }}
                  className={[
                    "flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition-colors",
                    "focus-visible:outline-none",
                    "disabled:opacity-40 disabled:pointer-events-none",
                    danger ? "text-red-600" : "text-slate-700",
                  ].join(" ")}
                >
                  {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${danger ? "text-red-500" : "text-slate-400"}`} />}
                  <span className="flex-1 text-left">{item.label}</span>
                  {item.checked && (
                    <motion.span
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 600, damping: 20 }}
                    >
                      <Check className="h-3.5 w-3.5 text-indigo-600" />
                    </motion.span>
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export interface KebabMenuProps {
  items:      MenuItem[];
  onSelect?:  (key: string) => void;
  align?:     "left" | "right";
  className?: string;
}

export function KebabMenu({ items, onSelect, align = "right", className = "" }: KebabMenuProps) {
  return (
    <DropdownMenu
      trigger={
        <motion.button
          type="button"
          whileHover={{ scale: 1.08 }}
          whileTap={{ scale: 0.9 }}
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </motion.button>
      }
      items={items} onSelect={onSelect} align={align} className={className}
    />
  );
}
