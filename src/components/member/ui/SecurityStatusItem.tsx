import type { LucideIcon } from "lucide-react";

interface SecurityStatusItemProps {
  icon: LucideIcon;
  label: string;
  value: string;
  badge?: { text: string; color: string };
  action?: { label: string; onClick?: () => void };
  last?: boolean;
}

export default function SecurityStatusItem({
  icon: Icon, label, value, badge, action, last = false,
}: SecurityStatusItemProps) {
  return (
    <div className={`flex items-center justify-between gap-3 ${!last ? "pb-3 border-b border-slate-100 mb-3" : ""}`}>
      <div className="flex items-center gap-2.5">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-slate-100">
          <Icon className="h-3.5 w-3.5 text-slate-600" strokeWidth={2} />
        </div>
        <div>
          <p className="text-xs font-medium text-slate-800">{label}</p>
          <p className="text-[11px] text-slate-400">{value}</p>
        </div>
      </div>
      <div className="flex items-center gap-2">
        {badge && (
          <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${badge.color}`}>{badge.text}</span>
        )}
        {action && (
          <button type="button" onClick={action.onClick} className="text-[11px] font-medium text-indigo-600 hover:underline whitespace-nowrap">
            {action.label}
          </button>
        )}
      </div>
    </div>
  );
}
