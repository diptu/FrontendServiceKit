import type { ReactNode } from "react";
import Link from "next/link";

interface MemberCardProps {
  title: string;
  viewAllHref?: string;
  viewAllLabel?: string;
  children: ReactNode;
  footer?: ReactNode;
  className?: string;
}

export default function MemberCard({
  title, viewAllHref, viewAllLabel = "View All", children, footer, className = "",
}: MemberCardProps) {
  return (
    <div className={`flex flex-col rounded-xl border border-slate-200 bg-white shadow-sm ${className}`}>
      <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>
        {viewAllHref && (
          <Link href={viewAllHref} className="text-xs font-medium text-indigo-600 hover:underline">
            {viewAllLabel} →
          </Link>
        )}
      </div>
      <div className="flex-1 p-4">{children}</div>
      {footer && <div className="border-t border-slate-100 px-4 py-3">{footer}</div>}
    </div>
  );
}
