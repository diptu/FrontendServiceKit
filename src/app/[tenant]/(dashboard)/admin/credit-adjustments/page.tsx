"use client";

import { useState } from "react";
import { Wallet, TrendingUp, TrendingDown, Clock, Plus, ChevronLeft, ChevronRight } from "lucide-react";

interface CreditEntry {
  id: string;
  date: string;
  user: string;
  type: "credit" | "debit" | "adjustment";
  amount: number;
  reason: string;
  balance: number;
  status: "Completed" | "Pending" | "Reversed";
}

const MOCK_ENTRIES: CreditEntry[] = [
  { id: "1",  date: "2026-06-24", user: "admin@applecorp.test",          type: "credit",     amount:  500, reason: "Monthly plan top-up",              balance: 2490, status: "Completed" },
  { id: "2",  date: "2026-06-22", user: "user1.apple_corp@example.test", type: "debit",      amount: -120, reason: "API overage charge",               balance: 1990, status: "Completed" },
  { id: "3",  date: "2026-06-20", user: "admin@applecorp.test",          type: "adjustment", amount:   50, reason: "Support credit — SLA breach",      balance: 2110, status: "Completed" },
  { id: "4",  date: "2026-06-18", user: "user2.apple_corp@example.test", type: "debit",      amount:  -80, reason: "Storage quota extension",          balance: 2060, status: "Completed" },
  { id: "5",  date: "2026-06-15", user: "admin@applecorp.test",          type: "credit",     amount: 1000, reason: "Annual plan renewal credit",        balance: 2140, status: "Completed" },
  { id: "6",  date: "2026-06-12", user: "user1.apple_corp@example.test", type: "debit",      amount:  -60, reason: "Additional seat license",          balance: 1140, status: "Completed" },
  { id: "7",  date: "2026-06-10", user: "admin@applecorp.test",          type: "adjustment", amount:  -30, reason: "Billing correction",               balance: 1200, status: "Reversed"  },
  { id: "8",  date: "2026-06-08", user: "user3.apple_corp@example.test", type: "debit",      amount:  -45, reason: "Premium support add-on",           balance: 1230, status: "Completed" },
  { id: "9",  date: "2026-06-05", user: "admin@applecorp.test",          type: "credit",     amount:  200, reason: "Referral bonus credit",            balance: 1275, status: "Pending"   },
  { id: "10", date: "2026-06-01", user: "admin@applecorp.test",          type: "credit",     amount:  500, reason: "Monthly plan top-up",              balance: 1075, status: "Completed" },
  { id: "11", date: "2026-05-28", user: "user1.apple_corp@example.test", type: "debit",      amount:  -90, reason: "Webhook event volume charge",      balance:  575, status: "Completed" },
  { id: "12", date: "2026-05-25", user: "admin@applecorp.test",          type: "adjustment", amount:   25, reason: "Downtime compensation",            balance:  665, status: "Completed" },
];

const PAGE_SIZE = 8;

const TYPE_STYLES = {
  credit:     "bg-emerald-50 text-emerald-700",
  debit:      "bg-red-50 text-red-700",
  adjustment: "bg-amber-50 text-amber-700",
};

const STATUS_STYLES: Record<CreditEntry["status"], string> = {
  Completed: "bg-emerald-50 text-emerald-700",
  Pending:   "bg-amber-50 text-amber-700",
  Reversed:  "bg-gray-100 text-gray-500",
};

export default function CreditAdjustmentsPage() {
  const [page, setPage] = useState(1);
  const [filter, setFilter] = useState<"all" | "credit" | "debit" | "adjustment">("all");

  const filtered = filter === "all" ? MOCK_ENTRIES : MOCK_ENTRIES.filter((e) => e.type === filter);
  const totalPages = Math.ceil(filtered.length / PAGE_SIZE);
  const paginated = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const totalCredits  = MOCK_ENTRIES.filter((e) => e.amount > 0).reduce((s, e) => s + e.amount, 0);
  const totalDebits   = MOCK_ENTRIES.filter((e) => e.amount < 0).reduce((s, e) => s + e.amount, 0);
  const currentBalance = MOCK_ENTRIES[0].balance;
  const pendingCount  = MOCK_ENTRIES.filter((e) => e.status === "Pending").length;

  function handleFilterChange(next: typeof filter) {
    setFilter(next);
    setPage(1);
  }

  return (
    <div className="flex flex-col gap-8">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-slate-800">Credit Balance Adjustments</h1>
          <p className="mt-1 text-sm text-slate-500">
            Track credit top-ups, usage debits, and manual adjustments for this tenant.
          </p>
        </div>
        <button className="inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
          <Plus className="h-4 w-4" />
          Add Adjustment
        </button>
      </div>

      {/* Stat cards */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {[
          { label: "Current Balance", value: `$${currentBalance.toLocaleString()}`, icon: Wallet,       color: "text-indigo-600",  bg: "bg-indigo-50"  },
          { label: "Total Credits",   value: `+$${totalCredits.toLocaleString()}`,  icon: TrendingUp,   color: "text-emerald-600", bg: "bg-emerald-50" },
          { label: "Total Debits",    value: `$${totalDebits.toLocaleString()}`,     icon: TrendingDown, color: "text-red-600",     bg: "bg-red-50"     },
          { label: "Pending",         value: String(pendingCount),                   icon: Clock,        color: "text-amber-600",   bg: "bg-amber-50"   },
        ].map((stat) => {
          const Icon = stat.icon;
          return (
            <div key={stat.label} className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm">
              <span className={`flex h-9 w-9 items-center justify-center rounded-lg ${stat.bg} ${stat.color}`}>
                <Icon className="h-[18px] w-[18px]" strokeWidth={2} />
              </span>
              <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-800">{stat.value}</p>
              <p className="mt-0.5 text-xs font-medium text-slate-500">{stat.label}</p>
            </div>
          );
        })}
      </section>

      {/* Table */}
      <section className="rounded-xl border border-gray-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-gray-100 px-6 py-4">
          <h2 className="text-base font-semibold text-slate-800">Transaction History</h2>
          {/* Filter tabs */}
          <div className="flex rounded-lg border border-gray-200 bg-gray-50 p-0.5">
            {(["all", "credit", "debit", "adjustment"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => handleFilterChange(tab)}
                className={`rounded-md px-3 py-1.5 text-xs font-semibold capitalize transition-colors ${
                  filter === tab ? "bg-white text-slate-800 shadow-sm" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50">
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Date</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Initiated By</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Type</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Reason</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Amount</th>
                <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">Balance After</th>
                <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {paginated.map((entry) => (
                <tr key={entry.id} className="transition-colors hover:bg-gray-50">
                  <td className="px-6 py-4 text-slate-500">{entry.date}</td>
                  <td className="px-6 py-4 font-medium text-slate-800">{entry.user}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${TYPE_STYLES[entry.type]}`}>
                      {entry.type}
                    </span>
                  </td>
                  <td className="max-w-xs px-6 py-4 text-slate-500">{entry.reason}</td>
                  <td className={`px-6 py-4 text-right font-semibold tabular-nums ${entry.amount >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                    {entry.amount >= 0 ? "+" : ""}${Math.abs(entry.amount)}
                  </td>
                  <td className="px-6 py-4 text-right font-medium tabular-nums text-slate-700">
                    ${entry.balance.toLocaleString()}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[entry.status]}`}>
                      {entry.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-3">
          <span className="text-xs text-slate-400">
            {filtered.length === 0
              ? "No results"
              : `${(page - 1) * PAGE_SIZE + 1}–${Math.min(page * PAGE_SIZE, filtered.length)} of ${filtered.length} entries`}
          </span>
          <div className="flex items-center gap-1">
            <button
              disabled={page === 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-md border border-gray-200 p-1.5 text-slate-400 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronLeft className="h-3.5 w-3.5" />
            </button>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
              <button
                key={p}
                onClick={() => setPage(p)}
                className={`min-w-[28px] rounded-md border px-2 py-1 text-xs font-medium transition-colors ${
                  p === page ? "border-indigo-600 bg-indigo-600 text-white" : "border-gray-200 text-slate-600 hover:bg-gray-50"
                }`}
              >
                {p}
              </button>
            ))}
            <button
              disabled={page === totalPages || totalPages === 0}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-md border border-gray-200 p-1.5 text-slate-400 transition-colors hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40"
            >
              <ChevronRight className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
