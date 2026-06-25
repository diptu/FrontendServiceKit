"use client";

interface Tab {
  label: string;
  count?: number;
}

interface TabBarProps {
  tabs: Tab[];
  active: string;
  onChange: (label: string) => void;
  variant?: "pills" | "underline";
}

export default function TabBar({ tabs, active, onChange, variant = "pills" }: TabBarProps) {
  if (variant === "underline") {
    return (
      <div className="flex gap-1 overflow-x-auto">
        {tabs.map((tab) => (
          <button
            key={tab.label}
            type="button"
            onClick={() => onChange(tab.label)}
            className={`whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
              active === tab.label
                ? "bg-green-600 text-white shadow-sm"
                : "text-slate-500 hover:bg-slate-100 hover:text-slate-700"
            }`}
          >
            {tab.label}
            {tab.count !== undefined && (
              <span
                className={`ml-1.5 rounded-full px-1.5 py-0.5 text-[10px] ${
                  active === tab.label ? "bg-green-500 text-white" : "bg-slate-100 text-slate-500"
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>
    );
  }

  return (
    <div className="flex rounded-lg border border-slate-200 bg-slate-50 p-0.5">
      {tabs.map((tab) => (
        <button
          key={tab.label}
          type="button"
          onClick={() => onChange(tab.label)}
          className={`flex items-center gap-1.5 whitespace-nowrap rounded-md px-3 py-1.5 text-xs font-semibold transition-colors ${
            active === tab.label
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-700"
          }`}
        >
          {tab.label}
          {tab.count !== undefined && (
            <span
              className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                active === tab.label ? "bg-slate-100 text-slate-600" : "bg-slate-200 text-slate-500"
              }`}
            >
              {tab.count}
            </span>
          )}
        </button>
      ))}
    </div>
  );
}
