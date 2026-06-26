"use client";

import { CreditCard, CheckCircle2, Clock, Download, ChevronRight } from "lucide-react";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui";
import { Button } from "@/components/ui";

const PERMISSIONS = [
  { label: "View Meal Plans",        granted: true  },
  { label: "Order Meals",            granted: true  },
  { label: "Track Deliveries",       granted: true  },
  { label: "Submit Claims",          granted: true  },
  { label: "Access Nutrition Data",  granted: true  },
  { label: "Modify Subscription",    granted: false },
  { label: "Cancel Plan",            granted: false },
  { label: "Access Premium Recipes", granted: false },
];

const INVOICES = [
  { period: "Jun 2026",  amount: "$120.00", status: "paid",    date: "Jun 1, 2026"  },
  { period: "May 2026",  amount: "$120.00", status: "paid",    date: "May 1, 2026"  },
  { period: "Apr 2026",  amount: "$120.00", status: "paid",    date: "Apr 1, 2026"  },
  { period: "Mar 2026",  amount: "$95.00",  status: "paid",    date: "Mar 1, 2026"  },
];

const USAGE = [
  { label: "Meals Ordered",    current: 48,  limit: 90,  pct: 53, color: "bg-indigo-500" },
  { label: "Active Days",      current: 22,  limit: 30,  pct: 73, color: "bg-emerald-500"},
  { label: "Claims Used",      current: 2,   limit: 5,   pct: 40, color: "bg-amber-500"  },
];

export default function BillingPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Bills & Permissions</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage your subscription, invoices, and access permissions.</p>
        </div>
        <Button variant="secondary" size="sm" icon={Download}>Download Invoices</Button>
      </FadeIn>

      {/* Current plan card */}
      <SlideUp className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-600 to-violet-700 p-6 text-white shadow-md">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs font-medium text-indigo-200">Current Plan</p>
            <h2 className="mt-1 text-2xl font-bold">Balanced Plan</h2>
            <p className="mt-1 text-sm text-indigo-200">3 meals/day · 1,200–2,400 kcal · Standard delivery</p>
          </div>
          <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-white/20 text-3xl">
            🥗
          </div>
        </div>
        <div className="mt-5 flex items-end justify-between gap-4">
          <div>
            <p className="text-3xl font-extrabold">$120<span className="text-base font-normal text-indigo-200">/mo</span></p>
            <p className="mt-1 text-xs text-indigo-300">Next billing: Jul 1, 2026</p>
          </div>
          <button type="button" className="flex items-center gap-1.5 rounded-lg bg-white/20 px-4 py-2 text-xs font-semibold text-white hover:bg-white/30 transition-colors">
            Upgrade Plan <ChevronRight className="h-3.5 w-3.5" />
          </button>
        </div>
      </SlideUp>

      <SlideUp delay={0.04} className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Usage */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Plan Usage</h2>
          <div className="flex flex-col gap-5">
            {USAGE.map(u => (
              <div key={u.label}>
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium text-slate-700">{u.label}</span>
                  <span className="font-semibold text-slate-900">{u.current} / {u.limit}</span>
                </div>
                <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                  <div className={`h-2 rounded-full ${u.color} transition-all duration-700`} style={{ width: `${u.pct}%` }} />
                </div>
                <p className="mt-0.5 text-right text-[10px] text-slate-400">{u.pct}% used</p>
              </div>
            ))}
          </div>
        </div>

        {/* Permissions */}
        <div className="lg:col-span-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Access Permissions</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0">
            {PERMISSIONS.map((p, i) => (
              <div key={p.label} className={`flex items-center gap-3 px-4 py-3 ${i % 2 === 0 && i + 1 < PERMISSIONS.length ? "sm:border-r sm:border-slate-100" : ""} border-b border-slate-50`}>
                {p.granted
                  ? <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-500" />
                  : <div className="h-4 w-4 shrink-0 rounded-full border-2 border-slate-200" />}
                <span className={`text-xs font-medium ${p.granted ? "text-slate-800" : "text-slate-400"}`}>{p.label}</span>
                {!p.granted && <span className="ml-auto text-[10px] font-semibold text-amber-600 bg-amber-50 border border-amber-200 rounded-full px-2 py-0.5">Upgrade</span>}
              </div>
            ))}
          </div>
        </div>
      </SlideUp>

      {/* Invoices */}
      <SlideUp delay={0.08} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Invoice History</h2>
        </div>
        <div className="divide-y divide-slate-50">
          {INVOICES.map(inv => (
            <div key={inv.period} className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-slate-50/60 transition-colors">
              <div className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                  <CreditCard className="h-4 w-4 text-slate-500" />
                </div>
                <div>
                  <p className="text-xs font-medium text-slate-900">Balanced Plan — {inv.period}</p>
                  <p className="text-[11px] text-slate-400">Billed on {inv.date}</p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-sm font-bold text-slate-900">{inv.amount}</span>
                <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">
                  <CheckCircle2 className="h-3 w-3" />Paid
                </span>
                <button type="button" className="flex items-center gap-1 text-xs text-slate-400 hover:text-indigo-600 transition-colors">
                  <Download className="h-3 w-3" />PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      </SlideUp>
    </div>
  );
}
