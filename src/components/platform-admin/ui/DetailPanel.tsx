"use client";

import type { ReactNode } from "react";
import { X } from "lucide-react";

interface DetailPanelProps {
  title: string;
  badge?: ReactNode;
  onClose: () => void;
  footer?: ReactNode;
  children: ReactNode;
}

export default function DetailPanel({ title, badge, onClose, footer, children }: DetailPanelProps) {
  return (
    <div className="w-80 shrink-0 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-start justify-between border-b border-slate-100 px-5 py-4">
        <div>
          <p className="text-sm font-semibold text-slate-900">{title}</p>
          {badge && <div className="mt-1">{badge}</div>}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="rounded-md p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
      <div className="flex max-h-[calc(100vh-16rem)] flex-col gap-4 overflow-y-auto px-5 py-4">
        {children}
      </div>
      {footer && <div className="border-t border-slate-100 px-5 py-4">{footer}</div>}
    </div>
  );
}
