"use client";

import { type ReactNode } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Info, CheckCircle, AlertTriangle, XCircle, X,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Variant config ─────────────────────────────────────────────────────── */
const ALERT_STYLES = {
  info:    { outer: "border-sky-200   bg-sky-50",    icon: "text-sky-500",     title: "text-sky-900",    body: "text-sky-700",    Icon: Info           },
  success: { outer: "border-emerald-200 bg-emerald-50", icon: "text-emerald-500", title: "text-emerald-900",body: "text-emerald-700", Icon: CheckCircle    },
  warning: { outer: "border-amber-200 bg-amber-50",  icon: "text-amber-500",   title: "text-amber-900",  body: "text-amber-700",  Icon: AlertTriangle  },
  error:   { outer: "border-red-200   bg-red-50",    icon: "text-red-500",     title: "text-red-900",    body: "text-red-700",    Icon: XCircle        },
} as const;

export type AlertVariant = keyof typeof ALERT_STYLES;

/* ── Alert ──────────────────────────────────────────────────────────────── */
export interface AlertProps {
  variant?:     AlertVariant;
  title?:       string;
  children?:    ReactNode;
  icon?:        LucideIcon;
  onDismiss?:   () => void;
  action?:      ReactNode;
  compact?:     boolean;
  show?:        boolean;
  className?:   string;
}

export function Alert({
  variant = "info",
  title,
  children,
  icon,
  onDismiss,
  action,
  compact = false,
  show = true,
  className = "",
}: AlertProps) {
  const cfg  = ALERT_STYLES[variant];
  const Icon = (icon as LucideIcon | undefined) ?? cfg.Icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          role="alert"
          initial={{ opacity: 0, y: -6, scale: 0.98 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: -6, scale: 0.98, height: 0, marginBottom: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className={[
            "flex gap-3 rounded-xl border",
            compact ? "px-4 py-3" : "px-4 py-4",
            cfg.outer,
            className,
          ].join(" ")}
        >
          <Icon className={`mt-0.5 h-4 w-4 shrink-0 ${cfg.icon}`} />
          <div className="flex-1 min-w-0">
            {title && (
              <p className={`text-sm font-semibold ${cfg.title}`}>{title}</p>
            )}
            {children && (
              <div className={`text-sm ${title ? "mt-1" : ""} ${cfg.body}`}>
                {children}
              </div>
            )}
            {action && <div className="mt-3">{action}</div>}
          </div>
          {onDismiss && (
            <motion.button
              type="button"
              onClick={onDismiss}
              whileHover={{ scale: 1.15, backgroundColor: "rgba(0,0,0,0.08)" }}
              whileTap={{ scale: 0.9 }}
              transition={{ type: "spring", stiffness: 500, damping: 30 }}
              className={`shrink-0 rounded p-0.5 transition-colors ${cfg.icon}`}
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

/* ── Banner (persistent, full-width) ───────────────────────────────────── */
export interface BannerProps {
  variant?:   AlertVariant;
  children:   ReactNode;
  onDismiss?: () => void;
  action?:    ReactNode;
  showIcon?:  boolean;
  show?:      boolean;
  className?: string;
}

export function Banner({
  variant = "info",
  children,
  onDismiss,
  action,
  showIcon = false,
  show = true,
  className = "",
}: BannerProps) {
  const cfg  = ALERT_STYLES[variant];
  const Icon = cfg.Icon;

  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
          className={[
            "flex items-center gap-2.5 rounded-xl border px-4 py-2.5 text-sm overflow-hidden",
            cfg.outer,
            className,
          ].join(" ")}
        >
          {showIcon && <Icon className={`h-3.5 w-3.5 shrink-0 ${cfg.icon}`} />}
          <span className={`flex-1 ${cfg.body}`}>{children}</span>
          {action && <div className="shrink-0">{action}</div>}
          {onDismiss && (
            <motion.button
              type="button"
              onClick={onDismiss}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.9 }}
              className={`shrink-0 rounded p-0.5 hover:bg-black/10 transition-colors ${cfg.icon}`}
              aria-label="Dismiss"
            >
              <X className="h-3.5 w-3.5" />
            </motion.button>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
