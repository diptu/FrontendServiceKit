"use client";

import { useState } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  Download, CreditCard, CheckCircle2, Clock, HelpCircle,
  TrendingUp, Phone, Mail, Calendar, ChevronLeft, ChevronRight, AlertCircle,
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn } from "@/components/ui";
import { Button } from "@/components/ui";

/* ── Data ───────────────────────────────────────────────────────────────── */
const BILLING_TREND = [
  { month: "Jan", plan: 1250, paid: 1250, outstanding: 0   },
  { month: "Feb", plan: 1250, paid: 1100, outstanding: 150 },
  { month: "Mar", plan: 1250, paid: 1250, outstanding: 0   },
  { month: "Apr", plan: 1500, paid: 1500, outstanding: 0   },
  { month: "May", plan: 1500, paid: 1250, outstanding: 250 },
  { month: "Jun", plan: 1500, paid: 1500, outstanding: 0   },
];

const INVOICES = [
  { id: "INV-2026-006", date: "Jun 1, 2026",  period: "Jun 2026",  total: "$1,500.00", paid: "$1,500.00", balance: "$0.00",    status: "paid"    },
  { id: "INV-2026-005", date: "May 1, 2026",  period: "May 2026",  total: "$1,500.00", paid: "$1,250.00", balance: "$250.00",  status: "partial" },
  { id: "INV-2026-004", date: "Apr 1, 2026",  period: "Apr 2026",  total: "$1,500.00", paid: "$1,500.00", balance: "$0.00",    status: "paid"    },
  { id: "INV-2026-003", date: "Mar 1, 2026",  period: "Mar 2026",  total: "$1,250.00", paid: "$1,250.00", balance: "$0.00",    status: "paid"    },
  { id: "INV-2026-002", date: "Feb 1, 2026",  period: "Feb 2026",  total: "$1,250.00", paid: "$1,100.00", balance: "$150.00",  status: "partial" },
  { id: "INV-2026-001", date: "Jan 1, 2026",  period: "Jan 2026",  total: "$1,250.00", paid: "$1,250.00", balance: "$0.00",    status: "paid"    },
];

const STATS = [
  { label: "Total Spent",    value: "$14,560.75", sub: "All time",              color: "bg-indigo-500"  },
  { label: "Plan Amount",    value: "$11,250.00", sub: "Current subscription",  color: "bg-emerald-500" },
  { label: "Due Amount",     value: "$3,210.75",  sub: "Outstanding balance",   color: "bg-amber-500"   },
  { label: "Next Due Date",  value: "Jul 05, 2026", sub: "Next billing cycle",  color: "bg-violet-500"  },
];

const PAYMENT_METHODS = [
  { brand: "Visa",       last4: "4242", expiry: "04/28", icon: "💳", primary: true  },
  { brand: "Mastercard", last4: "5678", expiry: "09/27", icon: "💳", primary: false },
];

const PAGE_SIZE = 5;

const STATUS_STYLE: Record<string, string> = {
  paid:    "bg-emerald-50 text-emerald-700 border-emerald-200",
  partial: "bg-amber-50 text-amber-700 border-amber-200",
  pending: "bg-slate-100 text-slate-600 border-slate-200",
};

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function BillingPage() {
  const [page, setPage] = useState(1);
  const totalPages = Math.ceil(INVOICES.length / PAGE_SIZE);
  const paginatedInvoices = INVOICES.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <FadeIn className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">My Bill</h1>
          <p className="mt-0.5 text-sm text-slate-500">View your billing summary and payment history.</p>
        </div>
        <Button variant="secondary" size="sm" icon={Download}>Download Statement</Button>
      </FadeIn>

      {/* Stat cards */}
      <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map(s => (
          <StaggerItem key={s.label}>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`mb-2 h-1.5 w-10 rounded-full ${s.color}`} />
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{s.sub}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Middle row: chart + account summary */}
      <SlideUp className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        {/* Billing overview chart */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Billing Overview</h2>
              <p className="text-xs text-slate-400">Plan amount vs payments vs outstanding</p>
            </div>
            <div className="flex items-center gap-1 text-xs font-medium text-emerald-600">
              <TrendingUp className="h-3.5 w-3.5" />+7.8% from last quarter
            </div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={BILLING_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="bPlan" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="bPaid" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(1)}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v) => [`$${Number(v).toLocaleString()}`, ""]} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="plan"        stroke="#6366f1" strokeWidth={2} fill="url(#bPlan)" name="Plan Amount" />
              <Area type="monotone" dataKey="paid"        stroke="#22c55e" strokeWidth={2} fill="url(#bPaid)" name="Payments" />
              <Area type="monotone" dataKey="outstanding" stroke="#f59e0b" strokeWidth={2} fill="none" strokeDasharray="4 4" name="Outstanding" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Account summary */}
        <ScaleIn className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Account Summary</h2>
            <div className="flex flex-col gap-2.5 text-xs">
              {[
                { label: "Billing Name", val: "NutraCorp Ltd." },
                { label: "Email", val: "billing@nutracorp.test" },
                { label: "Plan", val: "High Protein — 90 meals/mo" },
                { label: "Next Billing", val: "Jul 5, 2026" },
              ].map(item => (
                <div key={item.label} className="flex items-start justify-between gap-2 border-b border-slate-50 pb-2 last:border-0 last:pb-0">
                  <span className="font-medium text-slate-500">{item.label}</span>
                  <span className="text-right font-semibold text-slate-900">{item.val}</span>
                </div>
              ))}
              <div className="mt-1 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2">
                <CheckCircle2 className="h-4 w-4 shrink-0 text-emerald-600" />
                <div>
                  <p className="font-semibold text-emerald-800">Credit Balance</p>
                  <p className="text-emerald-600">$0.00 — No outstanding balance</p>
                </div>
              </div>
            </div>
            <Button fullWidth size="sm" className="mt-3">Make Payment</Button>
          </div>

          {/* Payment methods */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Payment Methods</h2>
            <div className="flex flex-col gap-2">
              {PAYMENT_METHODS.map(pm => (
                <motion.div
                  key={pm.last4}
                  whileHover={{ scale: 1.01 }}
                  className={`flex items-center justify-between rounded-lg border px-3 py-2.5 ${pm.primary ? "border-indigo-200 bg-indigo-50" : "border-slate-200 bg-white"}`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{pm.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-slate-900">{pm.brand} ···· {pm.last4}</p>
                      <p className="text-[10px] text-slate-400">Expires {pm.expiry}</p>
                    </div>
                  </div>
                  {pm.primary && <span className="rounded-full bg-indigo-100 px-2 py-0.5 text-[10px] font-semibold text-indigo-700">Primary</span>}
                </motion.div>
              ))}
              <button type="button" className="mt-1 text-left text-xs font-medium text-indigo-600 hover:text-indigo-500">+ Add payment method</button>
            </div>
          </div>

          {/* Need Help */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="flex items-center gap-2 mb-2">
              <HelpCircle className="h-4 w-4 text-indigo-400" />
              <h2 className="text-xs font-semibold text-slate-900">Need Help?</h2>
            </div>
            <div className="flex flex-col gap-2 text-xs text-slate-500">
              <a href="#" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <Mail className="h-3.5 w-3.5" />billing@nutratenant.test
              </a>
              <a href="#" className="flex items-center gap-2 hover:text-indigo-600 transition-colors">
                <Phone className="h-3.5 w-3.5" />+1 (800) 123-4567
              </a>
            </div>
          </div>
        </ScaleIn>
      </SlideUp>

      {/* Invoice history */}
      <SlideUp delay={0.06} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
          <h2 className="text-sm font-semibold text-slate-900">Invoice History</h2>
          <button type="button" className="flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-indigo-600 transition-colors">
            <Download className="h-3.5 w-3.5" />Download All
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="border-b border-slate-50 bg-slate-50">
              <tr>
                {["Invoice #", "Date", "Period", "Total Amount", "Paid Amount", "Balance", "Status", "Action"].map(h => (
                  <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {paginatedInvoices.map((inv, i) => (
                <motion.tr
                  key={inv.id}
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.05, duration: 0.3 }}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-3 font-mono font-medium text-indigo-600">{inv.id}</td>
                  <td className="px-4 py-3 text-slate-500 whitespace-nowrap">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="h-3 w-3 text-slate-400" />{inv.date}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{inv.period}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{inv.total}</td>
                  <td className="px-4 py-3 text-emerald-700 font-medium">{inv.paid}</td>
                  <td className="px-4 py-3">
                    {inv.balance === "$0.00"
                      ? <span className="text-slate-400">{inv.balance}</span>
                      : <span className="font-semibold text-amber-600">{inv.balance}</span>}
                  </td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[inv.status]}`}>
                      {inv.status === "paid" ? <CheckCircle2 className="h-3 w-3" /> : <Clock className="h-3 w-3" />}
                      {inv.status === "partial" ? "Partial" : inv.status.charAt(0).toUpperCase() + inv.status.slice(1)}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <button type="button" className="flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-[10px] font-medium text-slate-600 hover:bg-slate-50 transition-colors">
                      <Download className="h-3 w-3" />PDF
                    </button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span>Showing {Math.min(PAGE_SIZE, INVOICES.length - (page - 1) * PAGE_SIZE)} of {INVOICES.length} invoices</span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
              <button
                key={p}
                type="button"
                onClick={() => setPage(p)}
                className={`h-7 w-7 rounded text-[11px] font-medium transition-colors ${p === page ? "bg-indigo-600 text-white" : "border border-slate-200 text-slate-600 hover:bg-slate-100"}`}
              >
                {p}
              </button>
            ))}
            <button
              type="button"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
              className="flex h-7 w-7 items-center justify-center rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100 transition-colors"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </SlideUp>

      {/* Outstanding notice */}
      {STATS[2].value !== "$0.00" && (
        <SlideUp delay={0.1}>
          <div className="flex items-start gap-3 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3.5">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
            <div className="text-xs">
              <p className="font-semibold text-amber-800">Outstanding balance: {STATS[2].value}</p>
              <p className="mt-0.5 text-amber-700">Your account has an outstanding balance due on Jul 5, 2026. Please ensure timely payment to avoid service interruptions.</p>
            </div>
            <Button size="sm" className="ml-auto shrink-0">Pay Now</Button>
          </div>
        </SlideUp>
      )}
    </div>
  );
}
