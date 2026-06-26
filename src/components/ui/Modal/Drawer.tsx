"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";

const SIZE_MAP = { sm: "max-w-sm", md: "max-w-md", lg: "max-w-lg", xl: "max-w-xl" } as const;

export interface DrawerProps {
  open:         boolean;
  onClose:      () => void;
  title?:       string;
  description?: string;
  children?:    ReactNode;
  footer?:      ReactNode;
  side?:        "left" | "right";
  size?:        "sm" | "md" | "lg" | "xl";
  className?:   string;
}

export function Drawer({
  open, onClose, title, description, children, footer,
  side = "right", size = "md", className = "",
}: DrawerProps) {
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  return (
    <>
      <div
        onClick={onClose}
        className={[
          "fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px] transition-opacity duration-300",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        aria-hidden="true"
      />

      <div
        role="dialog"
        aria-modal="true"
        aria-label={title}
        className={[
          "fixed inset-y-0 z-50 flex w-full flex-col bg-white shadow-xl transition-transform duration-300",
          SIZE_MAP[size],
          side === "right" ? "right-0" : "left-0",
          side === "right"
            ? open ? "translate-x-0" : "translate-x-full"
            : open ? "translate-x-0" : "-translate-x-full",
          className,
        ].join(" ")}
      >
        {(title || description) && (
          <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
            <div className="pr-4">
              {title       && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
              {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
            </div>
            <button
              type="button"
              onClick={onClose}
              className="mt-0.5 rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
              aria-label="Close"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

        {footer && (
          <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
            {footer}
          </div>
        )}
      </div>
    </>
  );
}
