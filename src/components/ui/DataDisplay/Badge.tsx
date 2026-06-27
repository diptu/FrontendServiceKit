"use client";

import { type ReactNode } from "react";
import { motion } from "framer-motion";

/* ── Variant maps ──────────────────────────────────────────────────────── */
const VARIANT_STYLES = {
  default:  "bg-indigo-50  text-indigo-700  border-indigo-200",
  success:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  warning:  "bg-amber-50   text-amber-700   border-amber-200",
  error:    "bg-red-50     text-red-700     border-red-200",
  info:     "bg-sky-50     text-sky-700     border-sky-200",
  muted:    "bg-slate-100  text-slate-600   border-slate-200",
  violet:   "bg-violet-50  text-violet-700  border-violet-200",
} as const;

const SIZE_STYLES = {
  xs: "px-1.5 py-0   text-[9px]",
  sm: "px-2   py-0.5 text-[10px]",
  md: "px-2.5 py-0.5 text-xs",
  lg: "px-3   py-1   text-sm",
} as const;

export type BadgeVariant = keyof typeof VARIANT_STYLES;
export type BadgeSize    = keyof typeof SIZE_STYLES;

/* ── Badge ─────────────────────────────────────────────────────────────── */
export interface BadgeProps {
  variant?:   BadgeVariant;
  size?:      BadgeSize;
  dot?:       boolean;
  animate?:   boolean;
  children:   ReactNode;
  className?: string;
}

export function Badge({
  variant = "default",
  size = "sm",
  dot = false,
  animate = false,
  children,
  className = "",
}: BadgeProps) {
  const classes = [
    "inline-flex items-center gap-1 rounded-full border font-semibold",
    VARIANT_STYLES[variant],
    SIZE_STYLES[size],
    className,
  ].join(" ");

  const inner = (
    <>
      {dot && <span className="h-1.5 w-1.5 shrink-0 rounded-full bg-current opacity-70" />}
      {children}
    </>
  );

  if (animate) {
    return (
      <motion.span
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: "spring", stiffness: 600, damping: 22 }}
        className={classes}
      >
        {inner}
      </motion.span>
    );
  }

  return <span className={classes}>{inner}</span>;
}

/* ── StatusBadge ───────────────────────────────────────────────────────── */
const STATUS_MAP: Record<string, { label: string; variant: BadgeVariant }> = {
  active:              { label: "Active",           variant: "success" },
  inactive:            { label: "Inactive",         variant: "muted"   },
  suspended:           { label: "Suspended",        variant: "error"   },
  pending:             { label: "Pending",          variant: "warning" },
  approved:            { label: "Approved",         variant: "success" },
  rejected:            { label: "Rejected",         variant: "error"   },
  completed:           { label: "Completed",        variant: "success" },
  processing:          { label: "Processing",       variant: "default" },
  cancelled:           { label: "Cancelled",        variant: "error"   },
  delivered:           { label: "Delivered",        variant: "success" },
  "out-for-delivery":  { label: "Out for Delivery", variant: "info"    },
  preparing:           { label: "Preparing",        variant: "warning" },
  connected:           { label: "Connected",        variant: "success" },
  disconnected:        { label: "Disconnected",     variant: "muted"   },
  error:               { label: "Error",            variant: "error"   },
  healthy:             { label: "Healthy",          variant: "success" },
  degraded:            { label: "Degraded",         variant: "warning" },
  outage:              { label: "Outage",           variant: "error"   },
  online:              { label: "Online",           variant: "success" },
  offline:             { label: "Offline",          variant: "muted"   },
  revoked:             { label: "Revoked",          variant: "error"   },
  invited:             { label: "Invited",          variant: "info"    },
  busy:                { label: "Busy",             variant: "warning" },
  draft:               { label: "Draft",            variant: "muted"   },
  published:           { label: "Published",        variant: "success" },
  archived:            { label: "Archived",         variant: "muted"   },
};

export interface StatusBadgeProps {
  status:   string;
  size?:    BadgeSize;
  dot?:     boolean;
  animate?: boolean;
}

export function StatusBadge({ status, size = "sm", dot = false, animate = false }: StatusBadgeProps) {
  const cfg = STATUS_MAP[status.toLowerCase()] ?? { label: status, variant: "muted" as BadgeVariant };
  return (
    <Badge variant={cfg.variant} size={size} dot={dot} animate={animate}>
      {cfg.label}
    </Badge>
  );
}

/* ── RoleBadge ─────────────────────────────────────────────────────────── */
const ROLE_MAP: Record<string, BadgeVariant> = {
  "super admin":   "error",
  admin:           "violet",
  moderator:       "default",
  developer:       "info",
  "support agent": "warning",
  viewer:          "muted",
  owner:           "violet",
  member:          "muted",
};

export interface RoleBadgeProps {
  role:     string;
  size?:    BadgeSize;
  animate?: boolean;
}

export function RoleBadge({ role, size = "sm", animate = false }: RoleBadgeProps) {
  const variant = ROLE_MAP[role.toLowerCase()] ?? "muted";
  return (
    <Badge variant={variant} size={size} animate={animate}>
      {role}
    </Badge>
  );
}

/* ── PlanBadge ─────────────────────────────────────────────────────────── */
const PLAN_MAP: Record<string, BadgeVariant> = {
  free:       "muted",
  starter:    "info",
  pro:        "default",
  enterprise: "violet",
};

export interface PlanBadgeProps {
  plan:     string;
  size?:    BadgeSize;
  animate?: boolean;
}

export function PlanBadge({ plan, size = "sm", animate = false }: PlanBadgeProps) {
  const variant = PLAN_MAP[plan.toLowerCase()] ?? "muted";
  return (
    <Badge variant={variant} size={size} animate={animate}>
      {plan}
    </Badge>
  );
}
