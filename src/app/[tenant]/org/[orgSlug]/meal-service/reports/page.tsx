"use client";

import { FileText, BarChart2, Users, Package, Download, RefreshCw } from "lucide-react";
import { FadeIn, SlideUp } from "@/components/ui";
import { Button } from "@/components/ui";

const REPORT_TYPES = [
  {
    icon: BarChart2,
    title: "Revenue Report",
    desc: "Detailed revenue breakdown by plan, period, and customer segment.",
    lastGenerated: "Jun 25, 2026",
    color: "bg-indigo-500",
    iconColor: "text-indigo-600",
    iconBg: "bg-indigo-50",
  },
  {
    icon: Users,
    title: "Customer Report",
    desc: "Customer acquisition, retention, churn, and lifetime value analysis.",
    lastGenerated: "Jun 24, 2026",
    color: "bg-emerald-500",
    iconColor: "text-emerald-600",
    iconBg: "bg-emerald-50",
  },
  {
    icon: Package,
    title: "Orders Report",
    desc: "Order volume, fulfilment rates, delivery performance, and cancellations.",
    lastGenerated: "Jun 26, 2026",
    color: "bg-violet-500",
    iconColor: "text-violet-600",
    iconBg: "bg-violet-50",
  },
  {
    icon: FileText,
    title: "Nutrition Report",
    desc: "Aggregate nutrition data across all delivered meals and active plans.",
    lastGenerated: "Jun 22, 2026",
    color: "bg-amber-500",
    iconColor: "text-amber-600",
    iconBg: "bg-amber-50",
  },
];

const RECENT_REPORTS = [
  { name: "June 2026 Revenue Summary",       generated: "Jun 25, 2026", format: "PDF", size: "1.2 MB" },
  { name: "Q2 Customer Cohort Analysis",     generated: "Jun 24, 2026", format: "CSV", size: "840 KB" },
  { name: "June Orders Fulfilment Report",   generated: "Jun 26, 2026", format: "PDF", size: "2.1 MB" },
  { name: "Nutrition Compliance Jun 2026",   generated: "Jun 22, 2026", format: "PDF", size: "980 KB" },
];

export default function ReportsPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports</h1>
          <p className="mt-0.5 text-sm text-slate-500">Generate and download operational reports for the meal service.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" icon={RefreshCw}>Refresh</Button>
          <Button size="sm" icon={Download}>Download All</Button>
        </div>
      </FadeIn>

      <SlideUp className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {REPORT_TYPES.map(r => {
          const Icon = r.icon;
          return (
            <div key={r.title} className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${r.iconBg}`}>
                  <Icon className={`h-5 w-5 ${r.iconColor}`} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-sm font-semibold text-slate-900">{r.title}</h3>
                  <p className="text-[11px] text-slate-400">Last generated {r.lastGenerated}</p>
                </div>
              </div>
              <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
              <div className="flex items-center gap-2 mt-auto">
                <Button fullWidth size="sm" variant="secondary" icon={RefreshCw}>Generate</Button>
                <Button fullWidth size="sm" icon={Download}>Download</Button>
              </div>
            </div>
          );
        })}
      </SlideUp>

      <SlideUp delay={0.06} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Recent Reports</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {RECENT_REPORTS.map(r => (
            <div key={r.name} className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-3 min-w-0">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-50">
                  <FileText className="h-4 w-4 text-indigo-600" />
                </div>
                <div className="min-w-0">
                  <p className="truncate text-xs font-medium text-slate-900">{r.name}</p>
                  <p className="text-[11px] text-slate-400">{r.generated} · {r.format} · {r.size}</p>
                </div>
              </div>
              <button type="button" className="flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                <Download className="h-3 w-3" />Download
              </button>
            </div>
          ))}
        </div>
      </SlideUp>
    </div>
  );
}
