"use client";

export interface FilterOption {
  label:  string;
  value:  string;
  count?: number;
}

/* ── Single-select FilterBar ─────────────────────────────────────────────── */
export interface FilterBarProps {
  options:    FilterOption[];
  value:      string;
  onChange:   (value: string) => void;
  allLabel?:  string;
  className?: string;
}

export function FilterBar({
  options, value, onChange, allLabel = "All", className = "",
}: FilterBarProps) {
  const all: FilterOption = { label: allLabel, value: "all" };
  const items             = [all, ...options];

  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {items.map(opt => {
        const active = opt.value === value || (value === "" && opt.value === "all");
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value === "all" ? "" : opt.value)}
            className={[
              "flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              active
                ? "bg-indigo-600 text-white shadow-sm"
                : "border border-slate-200 bg-white text-slate-600 hover:border-indigo-300 hover:text-indigo-600",
            ].join(" ")}
          >
            {opt.label}
            {opt.count !== undefined && (
              <span className={`rounded-full px-1.5 text-[10px] font-bold ${active ? "bg-white/20 text-white" : "bg-slate-100 text-slate-500"}`}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}

/* ── Multi-select FilterChips ────────────────────────────────────────────── */
export interface FilterChipsProps {
  options:    FilterOption[];
  value:      string[];
  onChange:   (value: string[]) => void;
  className?: string;
}

export function FilterChips({ options, value, onChange, className = "" }: FilterChipsProps) {
  function toggle(v: string) {
    onChange(value.includes(v) ? value.filter(x => x !== v) : [...value, v]);
  }
  return (
    <div className={`flex flex-wrap gap-1.5 ${className}`}>
      {options.map(opt => {
        const active = value.includes(opt.value);
        return (
          <button
            key={opt.value}
            type="button"
            onClick={() => toggle(opt.value)}
            className={[
              "flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium transition-all",
              "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-indigo-500",
              active
                ? "bg-indigo-50 text-indigo-700 ring-1 ring-inset ring-indigo-200"
                : "border border-slate-200 bg-white text-slate-500 hover:border-indigo-200 hover:text-indigo-600",
            ].join(" ")}
          >
            {active && <span className="mr-0.5 h-1.5 w-1.5 rounded-full bg-indigo-600" />}
            {opt.label}
            {opt.count !== undefined && (
              <span className={`ml-1 rounded-full px-1 text-[10px] ${active ? "bg-indigo-100 text-indigo-600" : "bg-slate-100 text-slate-400"}`}>
                {opt.count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
