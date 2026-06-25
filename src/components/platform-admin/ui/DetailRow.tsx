import type { LucideIcon } from "lucide-react";

interface DetailRowProps {
  icon: LucideIcon;
  label: string;
  value: ReactNode;
}

import type { ReactNode } from "react";

export default function DetailRow({ icon: Icon, label, value }: DetailRowProps) {
  return (
    <div className="flex items-start gap-3">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" strokeWidth={2} />
      <div className="min-w-0">
        <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-400">{label}</p>
        <div className="mt-0.5 text-sm text-slate-700">{value}</div>
      </div>
    </div>
  );
}
