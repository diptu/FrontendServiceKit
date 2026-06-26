"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import { Check, MoreVertical } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────────── */
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

/* ── DropdownMenu ────────────────────────────────────────────────────────── */
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
      <div onClick={() => setOpen(prev => !prev)}>{trigger}</div>

      <div
        className={[
          "absolute z-50 mt-1.5 w-48 rounded-xl border border-slate-100 bg-white py-1 shadow-lg",
          "transition-all duration-150 origin-top",
          align === "right" ? "right-0" : "left-0",
          open ? "opacity-100 scale-100 pointer-events-auto" : "opacity-0 scale-95 pointer-events-none",
        ].join(" ")}
        role="menu"
      >
        {items.map((item, i) => {
          if (item.separator) {
            return <div key={`sep-${i}`} className="my-1 border-t border-slate-100" />;
          }
          const Icon    = item.icon;
          const danger  = item.variant === "danger";
          return (
            <button
              key={item.key}
              type="button"
              role="menuitem"
              disabled={item.disabled}
              onClick={() => {
                if (item.disabled) return;
                setOpen(false);
                onSelect?.(item.key);
              }}
              className={[
                "flex w-full items-center gap-2.5 px-3.5 py-2 text-sm transition-colors",
                "focus-visible:outline-none focus-visible:bg-slate-50",
                "disabled:opacity-40 disabled:pointer-events-none",
                danger
                  ? "text-red-600 hover:bg-red-50"
                  : "text-slate-700 hover:bg-slate-50",
              ].join(" ")}
            >
              {Icon && <Icon className={`h-3.5 w-3.5 shrink-0 ${danger ? "text-red-500" : "text-slate-400"}`} />}
              <span className="flex-1 text-left">{item.label}</span>
              {item.checked && <Check className="h-3.5 w-3.5 text-indigo-600" />}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/* ── Convenience: KebabMenu ─────────────────────────────────────────────── */
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
        <button
          type="button"
          className="flex h-7 w-7 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          aria-label="More actions"
        >
          <MoreVertical className="h-4 w-4" />
        </button>
      }
      items={items}
      onSelect={onSelect}
      align={align}
      className={className}
    />
  );
}
