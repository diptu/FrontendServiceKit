import type { ReactNode } from "react";

interface AdminTableProps {
  title?: string;
  subtitle?: string;
  toolbar?: ReactNode;
  footer?: ReactNode;
  children: ReactNode;
}

export default function AdminTable({ title, subtitle, toolbar, footer, children }: AdminTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {(title || toolbar) && (
        <div className="flex items-center justify-between border-b border-slate-100 px-6 py-4">
          {(title || subtitle) && (
            <div>
              {title && <h2 className="text-base font-semibold text-slate-900">{title}</h2>}
              {subtitle && <p className="text-xs text-slate-400">{subtitle}</p>}
            </div>
          )}
          {toolbar && <div className="flex items-center gap-2">{toolbar}</div>}
        </div>
      )}
      <div className="overflow-x-auto">{children}</div>
      {footer && (
        <div className="flex items-center justify-between border-t border-slate-100 px-6 py-3">
          {footer}
        </div>
      )}
    </section>
  );
}
