import type { ReactNode, HTMLAttributes } from "react";

/* ── Card ──────────────────────────────────────────────────────────────── */
export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  noPadding?: boolean;
  children:   ReactNode;
}

export function Card({ noPadding = false, children, className = "", ...props }: CardProps) {
  return (
    <div
      className={[
        "rounded-xl border border-slate-200 bg-white shadow-sm",
        noPadding ? "" : "",
        className,
      ].join(" ")}
      {...props}
    >
      {children}
    </div>
  );
}

/* ── CardHeader ────────────────────────────────────────────────────────── */
export interface CardHeaderProps {
  title:        ReactNode;
  description?: ReactNode;
  action?:      ReactNode;
  icon?:        ReactNode;
  border?:      boolean;
  className?:   string;
}

export function CardHeader({
  title,
  description,
  action,
  icon,
  border = true,
  className = "",
}: CardHeaderProps) {
  return (
    <div
      className={[
        "flex items-center justify-between gap-4 px-5 py-4",
        border ? "border-b border-slate-100" : "",
        className,
      ].join(" ")}
    >
      <div className="flex items-center gap-2.5 min-w-0">
        {icon && <span className="shrink-0 text-indigo-500">{icon}</span>}
        <div className="min-w-0">
          <p className="text-sm font-semibold text-slate-900 truncate">{title}</p>
          {description && (
            <p className="mt-0.5 text-xs text-slate-400 truncate">{description}</p>
          )}
        </div>
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  );
}

/* ── CardBody ──────────────────────────────────────────────────────────── */
export interface CardBodyProps {
  children:   ReactNode;
  className?: string;
  padding?:   "none" | "sm" | "md" | "lg";
}

const PADDING_MAP = { none: "", sm: "p-3", md: "p-5", lg: "p-6" } as const;

export function CardBody({ children, className = "", padding = "md" }: CardBodyProps) {
  return (
    <div className={[PADDING_MAP[padding], className].join(" ")}>
      {children}
    </div>
  );
}

/* ── CardFooter ────────────────────────────────────────────────────────── */
export interface CardFooterProps {
  children:   ReactNode;
  className?: string;
  align?:     "left" | "right" | "between";
}

const ALIGN_MAP = {
  left:    "justify-start",
  right:   "justify-end",
  between: "justify-between",
} as const;

export function CardFooter({ children, className = "", align = "right" }: CardFooterProps) {
  return (
    <div
      className={[
        "flex items-center gap-3 border-t border-slate-100 px-5 py-3",
        ALIGN_MAP[align],
        className,
      ].join(" ")}
    >
      {children}
    </div>
  );
}
