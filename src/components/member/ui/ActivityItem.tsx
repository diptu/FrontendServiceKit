import type { LucideIcon } from "lucide-react";

interface ActivityItemProps {
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description?: string;
  time: string;
  last?: boolean;
}

export default function ActivityItem({
  icon: Icon, iconBg, iconColor, title, description, time, last = false,
}: ActivityItemProps) {
  return (
    <div className={`flex gap-3 ${!last ? "pb-3 border-b border-slate-100" : ""}`}>
      <div className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${iconBg}`}>
        <Icon className={`h-3.5 w-3.5 ${iconColor}`} strokeWidth={2} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-medium text-slate-800 leading-snug">{title}</p>
        {description && <p className="text-[11px] text-slate-400 truncate">{description}</p>}
      </div>
      <span className="shrink-0 text-[10px] text-slate-400 whitespace-nowrap">{time}</span>
    </div>
  );
}
