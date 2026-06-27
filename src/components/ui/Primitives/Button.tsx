"use client";

import {
  type ButtonHTMLAttributes, type ReactNode,
  forwardRef, useRef, useState, useCallback,
} from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

/* ── Variant & size maps ───────────────────────────────────────────────── */
const VARIANT_STYLES = {
  primary:   "bg-indigo-600 text-white hover:bg-indigo-500 border-transparent shadow-sm",
  secondary: "bg-white text-slate-700 hover:bg-slate-50 border-slate-200",
  danger:    "bg-red-600 text-white hover:bg-red-500 border-transparent shadow-sm",
  ghost:     "bg-transparent text-slate-600 hover:bg-slate-100 border-transparent",
  outline:   "bg-transparent text-indigo-600 hover:bg-indigo-50 border-indigo-300",
  success:   "bg-emerald-600 text-white hover:bg-emerald-500 border-transparent shadow-sm",
  warning:   "bg-amber-500 text-white hover:bg-amber-400 border-transparent shadow-sm",
  link:      "bg-transparent text-indigo-600 hover:text-indigo-500 border-transparent underline-offset-2 hover:underline p-0 h-auto",
} as const;

const SIZE_STYLES = {
  xs: "h-7  px-2.5 text-[11px] gap-1.5 rounded-md",
  sm: "h-8  px-3   text-xs     gap-1.5 rounded-lg",
  md: "h-9  px-4   text-sm     gap-2   rounded-lg",
  lg: "h-11 px-5   text-base   gap-2   rounded-xl",
} as const;

const ICON_SIZE = { xs: "h-3 w-3", sm: "h-3.5 w-3.5", md: "h-4 w-4", lg: "h-5 w-5" } as const;

export type ButtonVariant = keyof typeof VARIANT_STYLES;
export type ButtonSize    = keyof typeof SIZE_STYLES;

/* ── Ripple item ───────────────────────────────────────────────────────── */
interface Ripple { id: number; x: number; y: number; size: number }

/* ── Button ─────────────────────────────────────────────────────────────── */
export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?:      ButtonVariant;
  size?:         ButtonSize;
  loading?:      boolean;
  icon?:         LucideIcon;
  iconPosition?: "left" | "right";
  fullWidth?:    boolean;
  children?:     ReactNode;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  function Button(
    {
      variant = "primary",
      size = "md",
      loading = false,
      icon: Icon,
      iconPosition = "left",
      fullWidth = false,
      disabled,
      children,
      className = "",
      onClick,
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;
    const [ripples, setRipples] = useState<Ripple[]>([]);
    const btnRef = useRef<HTMLButtonElement>(null);

    const addRipple = useCallback((e: React.MouseEvent<HTMLButtonElement>) => {
      const btn = (ref as React.RefObject<HTMLButtonElement>)?.current ?? btnRef.current;
      if (!btn || variant === "link") return;
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height) * 2;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;
      const id = Date.now();
      setRipples(prev => [...prev, { id, x, y, size }]);
      setTimeout(() => setRipples(prev => prev.filter(r => r.id !== id)), 600);
      onClick?.(e);
    }, [ref, variant, onClick]);

    /* hover scale: link has no scale; danger/primary use slightly less scale */
    const hoverScale = variant === "link" ? 1 : 1.02;
    const tapScale   = variant === "link" ? 1 : 0.96;

    return (
      <motion.button
        ref={ref ?? btnRef}
        disabled={isDisabled}
        whileHover={!isDisabled ? { scale: hoverScale } : {}}
        whileTap={!isDisabled ? { scale: tapScale } : {}}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className={[
          "relative inline-flex items-center justify-center font-semibold border overflow-hidden transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          VARIANT_STYLES[variant],
          variant !== "link" ? SIZE_STYLES[size] : "",
          fullWidth ? "w-full" : "",
          className,
        ].join(" ")}
        onClick={addRipple}
        {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
      >
        {/* Ripple layer */}
        <AnimatePresence>
          {ripples.map(r => (
            <motion.span
              key={r.id}
              initial={{ scale: 0, opacity: 0.35 }}
              animate={{ scale: 1, opacity: 0 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.55, ease: "easeOut" }}
              style={{
                position: "absolute",
                borderRadius: "50%",
                width: r.size,
                height: r.size,
                top: r.y,
                left: r.x,
                background: "currentColor",
                pointerEvents: "none",
              }}
            />
          ))}
        </AnimatePresence>

        {/* Content */}
        <AnimatePresence mode="wait" initial={false}>
          {loading ? (
            <motion.span
              key="loading"
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              transition={{ duration: 0.15 }}
              className="flex items-center gap-1.5"
            >
              <Loader2 className={`${ICON_SIZE[size]} animate-spin shrink-0`} />
            </motion.span>
          ) : (
            <motion.span
              key="content"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              transition={{ duration: 0.1 }}
              className="flex items-center gap-[inherit]"
              style={{ gap: "inherit" }}
            >
              {Icon && iconPosition === "left" && <Icon className={`${ICON_SIZE[size]} shrink-0`} />}
              {children}
              {Icon && iconPosition === "right" && <Icon className={`${ICON_SIZE[size]} shrink-0`} />}
            </motion.span>
          )}
        </AnimatePresence>
      </motion.button>
    );
  },
);

/* ── IconButton ────────────────────────────────────────────────────────── */
const ICON_BTN_SIZE = {
  xs: "h-6 w-6 rounded",
  sm: "h-7 w-7 rounded-md",
  md: "h-8 w-8 rounded-lg",
  lg: "h-10 w-10 rounded-xl",
} as const;

export interface IconButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  icon:     LucideIcon;
  label:    string;
  variant?: ButtonVariant;
  size?:    ButtonSize;
  loading?: boolean;
}

export function IconButton({
  icon: Icon,
  label,
  variant = "ghost",
  size = "md",
  loading = false,
  disabled,
  className = "",
  ...props
}: IconButtonProps) {
  const isDisabled = disabled || loading;
  return (
    <motion.button
      aria-label={label}
      title={label}
      disabled={isDisabled}
      whileHover={!isDisabled ? { scale: 1.08 } : {}}
      whileTap={!isDisabled ? { scale: 0.92, rotate: 3 } : {}}
      transition={{ type: "spring", stiffness: 500, damping: 25 }}
      className={[
        "inline-flex shrink-0 items-center justify-center border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
        "disabled:opacity-50 disabled:pointer-events-none",
        VARIANT_STYLES[variant],
        ICON_BTN_SIZE[size],
        className,
      ].join(" ")}
      {...(props as React.ComponentPropsWithoutRef<typeof motion.button>)}
    >
      {loading
        ? <Loader2 className={`${ICON_SIZE[size]} animate-spin`} />
        : <Icon className={ICON_SIZE[size]} />
      }
    </motion.button>
  );
}
