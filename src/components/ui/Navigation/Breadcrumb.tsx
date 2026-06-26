"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";

export interface BreadcrumbItem {
  label: string;
  href?:  string;
}

export interface BreadcrumbProps {
  items:      BreadcrumbItem[];
  showHome?:  boolean;
  className?: string;
}

export function Breadcrumb({ items, showHome = false, className = "" }: BreadcrumbProps) {
  const all: BreadcrumbItem[] = showHome ? [{ label: "Home", href: "/" }, ...items] : items;

  return (
    <nav aria-label="Breadcrumb" className={`flex items-center gap-1.5 ${className}`}>
      {showHome && (
        <Link href="/" className="text-slate-400 hover:text-slate-600 transition-colors">
          <Home className="h-3.5 w-3.5" />
        </Link>
      )}
      {all.map((item, i) => {
        const isLast = i === all.length - 1;
        const isHome = showHome && i === 0;
        if (isHome) return null;
        return (
          <span key={i} className="flex items-center gap-1.5">
            {i > 0 && <ChevronRight className="h-3.5 w-3.5 shrink-0 text-slate-300" />}
            {isLast || !item.href ? (
              <span className={`text-sm font-medium ${isLast ? "text-slate-900" : "text-slate-400"}`}>
                {item.label}
              </span>
            ) : (
              <Link
                href={item.href}
                className="text-sm font-medium text-slate-500 hover:text-slate-800 transition-colors"
              >
                {item.label}
              </Link>
            )}
          </span>
        );
      })}
    </nav>
  );
}
