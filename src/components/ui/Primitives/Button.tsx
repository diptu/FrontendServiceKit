"use client";

import { type ButtonHTMLAttributes, type ReactNode, forwardRef } from "react";
import type { LucideIcon } from "lucide-react";
import { Loader2 } from "lucide-react";

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
      ...props
    },
    ref,
  ) {
    const isDisabled = disabled || loading;

    return (
      <button
        ref={ref}
        disabled={isDisabled}
        className={[
          "inline-flex items-center justify-center font-semibold border transition-colors",
          "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-2",
          "disabled:opacity-50 disabled:pointer-events-none",
          VARIANT_STYLES[variant],
          variant !== "link" ? SIZE_STYLES[size] : "",
          fullWidth ? "w-full" : "",
          className,
        ].join(" ")}
        {...props}
      >
        {loading && <Loader2 className={`${ICON_SIZE[size]} animate-spin shrink-0`} />}
        {!loading && Icon && iconPosition === "left" && (
          <Icon className={`${ICON_SIZE[size]} shrink-0`} />
        )}
        {children}
        {!loading && Icon && iconPosition === "right" && (
          <Icon className={`${ICON_SIZE[size]} shrink-0`} />
        )}
      </button>
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
  return (
    <button
      aria-label={label}
      title={label}
      disabled={disabled || loading}
      className={[
        "inline-flex shrink-0 items-center justify-center border transition-colors",
        "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 focus-visible:ring-offset-1",
        "disabled:opacity-50 disabled:pointer-events-none",
        VARIANT_STYLES[variant],
        ICON_BTN_SIZE[size],
        className,
      ].join(" ")}
      {...props}
    >
      {loading
        ? <Loader2 className={`${ICON_SIZE[size]} animate-spin`} />
        : <Icon className={ICON_SIZE[size]} />
      }
    </button>
  );
}
