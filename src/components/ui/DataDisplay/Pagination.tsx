"use client";

import { ChevronLeft, ChevronRight } from "lucide-react";

export interface PaginationProps {
  total:             number;
  page:              number;
  pageSize:          number;
  onPageChange:      (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?:  number[];
  className?:        string;
}

export function Pagination({
  total, page, pageSize, onPageChange, onPageSizeChange,
  pageSizeOptions = [10, 20, 50], className = "",
}: PaginationProps) {
  const totalPages = Math.max(1, Math.ceil(total / pageSize));
  const start      = Math.min((page - 1) * pageSize + 1, total);
  const end        = Math.min(page * pageSize, total);

  function pages(): (number | "…")[] {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    if (page <= 4)       return [1, 2, 3, 4, 5, "…", totalPages];
    if (page >= totalPages - 3)
      return [1, "…", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages];
    return [1, "…", page - 1, page, page + 1, "…", totalPages];
  }

  return (
    <div className={`flex flex-wrap items-center justify-between gap-3 px-1 ${className}`}>
      <p className="text-xs text-slate-500">
        {total === 0
          ? "No results"
          : `Showing ${start}–${end} of ${total.toLocaleString()}`}
      </p>

      <div className="flex items-center gap-2">
        {onPageSizeChange && (
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-400">Rows</span>
            <select
              value={pageSize}
              onChange={e => { onPageSizeChange(Number(e.target.value)); onPageChange(1); }}
              className="h-7 rounded-md border border-slate-200 bg-white px-1.5 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              {pageSizeOptions.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
          </div>
        )}

        <div className="flex items-center gap-1">
          <button
            type="button"
            onClick={() => onPageChange(page - 1)}
            disabled={page <= 1}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Previous page"
          >
            <ChevronLeft className="h-3.5 w-3.5" />
          </button>

          {pages().map((p, i) =>
            p === "…" ? (
              <span key={`ellipsis-${i}`} className="flex h-7 w-7 items-center justify-center text-xs text-slate-400">
                …
              </span>
            ) : (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                className={[
                  "flex h-7 w-7 items-center justify-center rounded-lg text-xs font-medium transition-colors",
                  p === page
                    ? "bg-indigo-600 text-white shadow-sm"
                    : "border border-slate-200 text-slate-600 hover:bg-slate-50",
                ].join(" ")}
              >
                {p}
              </button>
            )
          )}

          <button
            type="button"
            onClick={() => onPageChange(page + 1)}
            disabled={page >= totalPages}
            className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-500 hover:bg-slate-50 disabled:opacity-40 disabled:pointer-events-none transition-colors"
            aria-label="Next page"
          >
            <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}
