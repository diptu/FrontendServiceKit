interface AppRowProps {
  name: string;
  description: string;
  category: string;
  accessLevel: "Full Access" | "Read Only" | "Limited" | "No Access";
  status: "Active" | "Inactive";
  initials: string;
  color: string;
  last?: boolean;
}

const ACCESS_BADGE: Record<string, string> = {
  "Full Access": "bg-emerald-50 text-emerald-700",
  "Read Only":   "bg-blue-50 text-blue-700",
  "Limited":     "bg-amber-50 text-amber-700",
  "No Access":   "bg-red-50 text-red-700",
};

export default function AppRow({ name, description, category, accessLevel, status, initials, color, last = false }: AppRowProps) {
  return (
    <div className={`flex items-center gap-3 ${!last ? "pb-3.5 border-b border-slate-100 mb-3.5" : ""}`}>
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${color}`}>
        {initials}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-semibold text-slate-900 truncate">{name}</p>
        <p className="text-[11px] text-slate-400 truncate">{description}</p>
      </div>
      <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACCESS_BADGE[accessLevel]}`}>{accessLevel}</span>
      <button
        type="button"
        disabled={status === "Inactive"}
        className="shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40"
      >
        Open
      </button>
    </div>
  );
}
