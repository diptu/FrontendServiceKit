import type { ReactNode } from "react";
import { Search } from "lucide-react";

interface SearchFilterBarProps {
  placeholder?: string;
  searchSlot?: ReactNode;
  children?: ReactNode;
}

export default function SearchFilterBar({ placeholder, searchSlot, children }: SearchFilterBarProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      {searchSlot ?? (
        <div className="relative min-w-[220px] max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder={placeholder ?? "Search…"}
            className="h-9 w-full rounded-lg border border-slate-200 bg-white pl-8 pr-3 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>
      )}
      {children}
    </div>
  );
}
