import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  icon: LucideIcon;
  value: string | number;
  label: string;
  sub?: string;
  bg: string;
  color: string;
}

export default function StatCard({ icon: Icon, value, label, sub, bg, color }: StatCardProps) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${bg} ${color}`}>
        <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
      </span>
      <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{value}</p>
      <p className="mt-0.5 text-xs font-semibold text-slate-600">{label}</p>
      {sub && <p className="text-[11px] text-slate-400">{sub}</p>}
    </div>
  );
}
