"use client";

import { useEffect, type ReactNode } from "react";
import { X } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

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

  const slideVariants = {
    hidden: { x: side === "right" ? "100%" : "-100%", opacity: 0 },
    show:   { x: 0, opacity: 1 },
    exit:   { x: side === "right" ? "100%" : "-100%", opacity: 0 },
  };

  return (
    <AnimatePresence>
      {open && (
        <>
          {/* Backdrop */}
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-[2px]"
            aria-hidden="true"
          />

          {/* Panel */}
          <motion.div
            key="panel"
            variants={slideVariants}
            initial="hidden"
            animate="show"
            exit="exit"
            transition={{ type: "spring", stiffness: 340, damping: 32 }}
            role="dialog"
            aria-modal="true"
            aria-label={title}
            className={[
              "fixed inset-y-0 z-50 flex w-full flex-col bg-white shadow-xl",
              SIZE_MAP[size],
              side === "right" ? "right-0" : "left-0",
              className,
            ].join(" ")}
          >
            {(title || description) && (
              <div className="flex items-start justify-between border-b border-slate-200 px-6 py-4">
                <div className="pr-4">
                  {title       && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
                  {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
                </div>
                <motion.button
                  type="button"
                  onClick={onClose}
                  whileHover={{ scale: 1.1, backgroundColor: "#f1f5f9" }}
                  whileTap={{ scale: 0.9 }}
                  transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  className="mt-0.5 rounded-lg p-1.5 text-slate-400 hover:text-slate-700 transition-colors"
                  aria-label="Close"
                >
                  <X className="h-4 w-4" />
                </motion.button>
              </div>
            )}

            <div className="flex-1 overflow-y-auto px-6 py-5">{children}</div>

            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-slate-200 px-6 py-4">
                {footer}
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
