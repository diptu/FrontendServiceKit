"use client";

import { Plus, Eye, ChevronRight } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn, SlideUp } from "@/components/ui";
import { Button } from "@/components/ui";

const STATS = [
  { label: "Total Claims", value: "12",  sub: "All time",      color: "bg-indigo-500"  },
  { label: "Pending",      value: "3",   sub: "Awaiting review",color: "bg-amber-500"   },
  { label: "Approved",     value: "8",   sub: "Reimbursed",    color: "bg-emerald-500" },
  { label: "Rejected",     value: "1",   sub: "Declined",      color: "bg-red-500"     },
];

const CLAIMS = [
  { id: "#CLM-041", type: "Delivery Issue",   date: "Jun 24, 2026", amount: "$18.00", status: "pending",  desc: "Meal arrived cold and packaging was damaged." },
  { id: "#CLM-040", type: "Missing Item",     date: "Jun 20, 2026", amount: "$6.50",  status: "approved", desc: "Protein shake was missing from the lunch order." },
  { id: "#CLM-039", type: "Meal Quality",     date: "Jun 15, 2026", amount: "$24.00", status: "approved", desc: "Chicken was undercooked, raised concern with support." },
  { id: "#CLM-038", type: "Wrong Order",      date: "Jun 10, 2026", amount: "$22.00", status: "rejected", desc: "Received a different meal plan from what was ordered." },
  { id: "#CLM-037", type: "Late Delivery",    date: "Jun 5, 2026",  amount: "$5.00",  status: "approved", desc: "Dinner was delivered 90 minutes late with no notification." },
];

const STATUS_STYLE: Record<string, string> = {
  pending:  "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

export default function ClaimsPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Claims</h1>
          <p className="mt-0.5 text-sm text-slate-500">Submit and track refund or reimbursement claims for your orders.</p>
        </div>
        <Button size="sm" icon={Plus}>New Claim</Button>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map(s => (
          <StaggerItem key={s.label}>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`mb-2 h-1.5 w-10 rounded-full ${s.color}`} />
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{s.sub}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <SlideUp className="flex flex-col gap-3">
        <h2 className="text-sm font-semibold text-slate-900">Claims History</h2>
        {CLAIMS.map(c => (
          <div key={c.id} className="flex items-start gap-4 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="min-w-0 flex-1">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-semibold text-indigo-600">{c.id}</span>
                <span className="text-xs font-medium text-slate-700">{c.type}</span>
                <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[c.status]}`}>{c.status}</span>
              </div>
              <p className="mt-1.5 text-xs text-slate-500 leading-relaxed">{c.desc}</p>
              <p className="mt-1 text-[11px] text-slate-400">{c.date}</p>
            </div>
            <div className="flex shrink-0 flex-col items-end gap-2">
              <span className="text-sm font-bold text-slate-900">{c.amount}</span>
              <button type="button" className="flex items-center gap-1 text-[11px] text-indigo-600 hover:underline">
                <Eye className="h-3 w-3" />View
              </button>
            </div>
          </div>
        ))}
      </SlideUp>

      <SlideUp delay={0.06} className="rounded-xl border border-indigo-100 bg-indigo-50 p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-sm font-semibold text-indigo-900">Have an issue with an order?</h3>
            <p className="mt-1 text-xs text-indigo-700 leading-relaxed">You can submit a claim for delivery issues, missing items, quality problems, or incorrect orders. Claims are typically reviewed within 2–3 business days.</p>
          </div>
          <button type="button" className="flex shrink-0 items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-2 text-xs font-semibold text-white hover:bg-indigo-700 transition-colors">
            File a Claim <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </SlideUp>
    </div>
  );
}
