"use client";

import type { ReactNode } from "react";
import { EmptyState } from "../Notification/EmptyState";
import { SkeletonTable } from "../Loading/Spinner";
import type { LucideIcon } from "lucide-react";
import { FileText } from "lucide-react";

/* ── Column definition ──────────────────────────────────────────────────── */
export interface Column<T> {
  key:              string;
  header:           string;
  render?:          (row: T, index: number) => ReactNode;
  className?:       string;
  headerClassName?: string;
  align?:           "left" | "center" | "right";
  width?:           string;
}

const ALIGN_MAP = { left: "text-left", center: "text-center", right: "text-right" } as const;

/* ── DataTable ──────────────────────────────────────────────────────────── */
export interface DataTableProps<T> {
  columns:          Column<T>[];
  data:             T[];
  rowKey:           (row: T) => string;
  loading?:         boolean;
  skeletonRows?:    number;
  emptyTitle?:      string;
  emptyDescription?: string;
  emptyIcon?:       LucideIcon;
  emptyState?:      ReactNode;
  footer?:          ReactNode;
  onRowClick?:      (row: T) => void;
  className?:       string;
}

export function DataTable<T>({
  columns, data, rowKey, loading = false, skeletonRows = 5,
  emptyTitle = "No results", emptyDescription, emptyIcon, emptyState,
  footer, onRowClick, className = "",
}: DataTableProps<T>) {
  if (loading) {
    return <SkeletonTable rows={skeletonRows} cols={columns.length} className={className} />;
  }

  return (
    <div className={`overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <table className="w-full text-left text-sm">
        <thead className="border-b border-slate-100 bg-slate-50">
          <tr>
            {columns.map(col => (
              <th
                key={col.key}
                className={[
                  "px-5 py-3.5 text-xs font-semibold text-slate-500",
                  ALIGN_MAP[col.align ?? "left"],
                  col.headerClassName ?? "",
                  col.width ? `w-[${col.width}]` : "",
                ].join(" ")}
              >
                {col.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-50">
          {data.length === 0 ? (
            <tr>
              <td colSpan={columns.length}>
                {emptyState ?? (
                  <EmptyState
                    icon={emptyIcon ?? FileText}
                    title={emptyTitle}
                    description={emptyDescription}
                    compact
                  />
                )}
              </td>
            </tr>
          ) : (
            data.map((row, idx) => (
              <tr
                key={rowKey(row)}
                onClick={onRowClick ? () => onRowClick(row) : undefined}
                className={[
                  "hover:bg-slate-50/60 transition-colors",
                  onRowClick ? "cursor-pointer" : "",
                ].join(" ")}
              >
                {columns.map(col => (
                  <td
                    key={col.key}
                    className={[
                      "px-5 py-3.5 text-slate-700",
                      ALIGN_MAP[col.align ?? "left"],
                      col.className ?? "",
                    ].join(" ")}
                  >
                    {col.render
                      ? col.render(row, idx)
                      : String((row as Record<string, unknown>)[col.key] ?? "—")
                    }
                  </td>
                ))}
              </tr>
            ))
          )}
        </tbody>
      </table>
      {footer && (
        <div className="flex items-center justify-between border-t border-slate-100 px-5 py-3">
          {footer}
        </div>
      )}
    </div>
  );
}

/* ── TableToolbar ───────────────────────────────────────────────────────── */
export interface TableToolbarProps {
  left?:   ReactNode;
  right?:  ReactNode;
  className?: string;
}

export function TableToolbar({ left, right, className = "" }: TableToolbarProps) {
  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 ${className}`}>
      <div className="flex flex-wrap items-center gap-2">{left}</div>
      <div className="flex flex-wrap items-center gap-2">{right}</div>
    </div>
  );
}
