"use client";

import type { ReactNode } from "react";
import type { LucideIcon } from "lucide-react";

/* ── Types ──────────────────────────────────────────────────────────────── */
export interface TabItem {
  key:      string;
  label:    string;
  icon?:    LucideIcon;
  badge?:   string | number;
  disabled?: boolean;
}

export type TabsVariant = "underline" | "pills" | "cards";

export interface TabsProps {
  tabs:      TabItem[];
  activeKey: string;
  onChange:  (key: string) => void;
  variant?:  TabsVariant;
  size?:     "sm" | "md";
  className?: string;
}

/* ── Tabs ───────────────────────────────────────────────────────────────── */
export function Tabs({
  tabs, activeKey, onChange,
  variant = "underline", size = "md", className = "",
}: TabsProps) {

  /* ── underline ── */
  if (variant === "underline") {
    return (
      <div className={`border-b border-slate-200 ${className}`}>
        <nav className="-mb-px flex gap-0" aria-label="Tabs">
          {tabs.map(tab => {
            const Icon    = tab.icon;
            const active  = tab.key === activeKey;
            const textSz  = size === "sm" ? "text-xs" : "text-sm";
            const padding  = size === "sm" ? "px-3 py-2" : "px-4 py-3";
            return (
              <button
                key={tab.key}
                type="button"
                disabled={tab.disabled}
                onClick={() => !tab.disabled && onChange(tab.key)}
                className={[
                  `flex items-center gap-1.5 border-b-2 font-medium transition-colors ${textSz} ${padding}`,
                  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                  "disabled:opacity-40 disabled:pointer-events-none",
                  active
                    ? "border-indigo-600 text-indigo-600"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300",
                ].join(" ")}
              >
                {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
                {tab.label}
                {tab.badge !== undefined && (
                  <span className={`rounded-full px-1.5 py-0.5 text-[10px] font-semibold ${active ? "bg-indigo-100 text-indigo-700" : "bg-slate-100 text-slate-500"}`}>
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </nav>
      </div>
    );
  }

  /* ── pills ── */
  if (variant === "pills") {
    return (
      <div className={`flex flex-wrap gap-1 ${className}`}>
        {tabs.map(tab => {
          const Icon   = tab.icon;
          const active = tab.key === activeKey;
          return (
            <button
              key={tab.key}
              type="button"
              disabled={tab.disabled}
              onClick={() => !tab.disabled && onChange(tab.key)}
              className={[
                "flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium transition-colors",
                "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
                "disabled:opacity-40 disabled:pointer-events-none",
                active
                  ? "bg-indigo-600 text-white shadow-sm"
                  : "text-slate-600 hover:bg-slate-100 hover:text-slate-900",
              ].join(" ")}
            >
              {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
              {tab.label}
              {tab.badge !== undefined && (
                <span className={`rounded-full px-1.5 text-[10px] font-semibold ${active ? "bg-white/20 text-white" : "bg-slate-200 text-slate-600"}`}>
                  {tab.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    );
  }

  /* ── cards ── */
  return (
    <div className={`flex gap-1 rounded-xl border border-slate-200 bg-slate-50 p-1 ${className}`}>
      {tabs.map(tab => {
        const Icon   = tab.icon;
        const active = tab.key === activeKey;
        return (
          <button
            key={tab.key}
            type="button"
            disabled={tab.disabled}
            onClick={() => !tab.disabled && onChange(tab.key)}
            className={[
              "flex flex-1 items-center justify-center gap-1.5 rounded-lg px-3 py-2 text-sm font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              "disabled:opacity-40 disabled:pointer-events-none",
              active
                ? "bg-white text-slate-900 shadow-sm"
                : "text-slate-500 hover:text-slate-800",
            ].join(" ")}
          >
            {Icon && <Icon className="h-3.5 w-3.5 shrink-0" />}
            {tab.label}
            {tab.badge !== undefined && (
              <span className={`rounded-full px-1.5 text-[10px] font-semibold ${active ? "bg-indigo-100 text-indigo-700" : "bg-slate-200 text-slate-500"}`}>
                {tab.badge}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── TabPanel ───────────────────────────────────────────────────────────── */
export interface TabPanelProps {
  activeKey:  string;
  tabKey:     string;
  children:   ReactNode;
  className?: string;
  keepMounted?: boolean;
}

export function TabPanel({ activeKey, tabKey, children, className = "", keepMounted = false }: TabPanelProps) {
  if (!keepMounted && activeKey !== tabKey) return null;
  return (
    <div
      role="tabpanel"
      hidden={activeKey !== tabKey}
      className={className}
    >
      {children}
    </div>
  );
}
