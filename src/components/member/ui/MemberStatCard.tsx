import type { LucideIcon } from "lucide-react";
import Link from "next/link";

interface MemberStatCardProps {
  icon: LucideIcon;
  value: number | string;
  label: string;
  sub?: string;
  href?: string;
  hrefLabel?: string;
  iconBg?: string;
  iconColor?: string;
}

export default function MemberStatCard({
  icon: Icon, value, label, sub, href, hrefLabel = "View all",
  iconBg = "bg-indigo-50", iconColor = "text-indigo-600",
}: MemberStatCardProps) {
  return (
    <div className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex items-start justify-between">
        <div className={`flex h-9 w-9 items-center justify-center rounded-lg ${iconBg}`}>
          <Icon className={`h-5 w-5 ${iconColor}`} strokeWidth={1.8} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold tracking-tight text-slate-900">{value}</p>
        <p className="text-sm font-medium text-slate-700">{label}</p>
        {sub && <p className="mt-0.5 text-xs text-slate-400">{sub}</p>}
      </div>
      {href && (
        <Link href={href} className="mt-auto text-xs font-medium text-indigo-600 hover:underline">
          {hrefLabel} →
        </Link>
      )}
    </div>
  );
}
