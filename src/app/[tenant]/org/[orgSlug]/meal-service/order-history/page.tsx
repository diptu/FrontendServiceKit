"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Search, Download, Filter, Eye, RotateCcw, ChevronLeft, ChevronRight,
  CheckCircle2, Clock, XCircle, RefreshCw, Calendar,
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn } from "@/components/ui";
import { Button } from "@/components/ui";

/* ── Data ───────────────────────────────────────────────────────────────── */
const ORDERS_STATUS_DATA = [
  { name: "Completed", value: 1254, color: "#6366f1" },
  { name: "Processing",value: 147,  color: "#f59e0b" },
  { name: "Pending",   value: 236,  color: "#94a3b8" },
  { name: "Cancelled", value: 147,  color: "#f43f5e" },
];

const STATS = [
  { label: "Completed Orders",  value: "1,254", sub: "All time",       color: "bg-indigo-500",  icon: CheckCircle2 },
  { label: "Cancelled",         value: "147",   sub: "All time",       color: "bg-rose-500",    icon: XCircle      },
  { label: "Pending",           value: "236",   sub: "Active",         color: "bg-amber-500",   icon: Clock        },
  { label: "Total Orders",      value: "1,784", sub: "All time",       color: "bg-violet-500",  icon: RefreshCw    },
  { label: "Total Revenue",     value: "$78,640", sub: "Lifetime",     color: "bg-emerald-500", icon: CheckCircle2 },
  { label: "Avg Order Value",   value: "$44.06",  sub: "Per order",    color: "bg-sky-500",     icon: CheckCircle2 },
];

const CUSTOMERS = [
  { initials: "AW", bg: "bg-indigo-500",  name: "Alice Wright",   email: "alice.w@nutracorp.test"  },
  { initials: "BK", bg: "bg-emerald-500", name: "Bob Keller",     email: "bob.k@nutracorp.test"    },
  { initials: "CN", bg: "bg-violet-500",  name: "Charlie Nguyen", email: "charlie.n@nutracorp.test"},
  { initials: "DO", bg: "bg-sky-500",     name: "Dana Osei",      email: "dana.o@nutracorp.test"   },
  { initials: "EM", bg: "bg-amber-500",   name: "Evan Marsh",     email: "evan.m@nutracorp.test"   },
  { initials: "FR", bg: "bg-rose-500",    name: "Fatima Reyes",   email: "fatima.r@nutracorp.test" },
  { initials: "GL", bg: "bg-teal-500",    name: "George Lin",     email: "george.l@nutracorp.test" },
  { initials: "HP", bg: "bg-purple-500",  name: "Hana Popov",     email: "hana.p@nutracorp.test"   },
];

const ORDERS = [
  { id: "#ORD-0144", custIdx: 0, plan: "High Protein",  date: "Jun 26, 2026", items: 3, total: "$42.00",  payment: "Visa ····4242",  status: "completed"  },
  { id: "#ORD-0143", custIdx: 1, plan: "Balanced",      date: "Jun 26, 2026", items: 2, total: "$28.00",  payment: "Mastercard ····5678", status: "processing" },
  { id: "#ORD-0142", custIdx: 2, plan: "Low Carb",      date: "Jun 25, 2026", items: 4, total: "$52.00",  payment: "Visa ····4242",  status: "pending"    },
  { id: "#ORD-0141", custIdx: 3, plan: "Vegetarian",    date: "Jun 25, 2026", items: 1, total: "$14.00",  payment: "Visa ····4242",  status: "completed"  },
  { id: "#ORD-0140", custIdx: 4, plan: "Keto",          date: "Jun 24, 2026", items: 3, total: "$38.50",  payment: "Mastercard ····5678", status: "cancelled"  },
  { id: "#ORD-0139", custIdx: 5, plan: "High Protein",  date: "Jun 24, 2026", items: 2, total: "$30.00",  payment: "Visa ····4242",  status: "completed"  },
  { id: "#ORD-0138", custIdx: 6, plan: "Mediterranean", date: "Jun 23, 2026", items: 5, total: "$68.75",  payment: "Mastercard ····5678", status: "completed"  },
  { id: "#ORD-0137", custIdx: 7, plan: "Balanced",      date: "Jun 23, 2026", items: 2, total: "$26.00",  payment: "Visa ····4242",  status: "processing" },
  { id: "#ORD-0136", custIdx: 0, plan: "Low Carb",      date: "Jun 22, 2026", items: 3, total: "$39.00",  payment: "Visa ····4242",  status: "completed"  },
  { id: "#ORD-0135", custIdx: 1, plan: "High Protein",  date: "Jun 22, 2026", items: 4, total: "$56.00",  payment: "Mastercard ····5678", status: "cancelled"  },
];

const STATUS_STYLE: Record<string, string> = {
  completed:  "bg-emerald-50 text-emerald-700 border-emerald-200",
  processing: "bg-indigo-50 text-indigo-700 border-indigo-200",
  pending:    "bg-amber-50 text-amber-700 border-amber-200",
  cancelled:  "bg-rose-50 text-rose-700 border-rose-200",
};

const STATUS_ICON: Record<string, typeof CheckCircle2> = {
  completed: CheckCircle2, processing: RefreshCw, pending: Clock, cancelled: XCircle,
};

const PAGE_SIZE = 8;
const totalPie = ORDERS_STATUS_DATA.reduce((s, d) => s + d.value, 0);

const PLAN_OPTIONS = ["All Plans", "High Protein", "Balanced", "Low Carb", "Vegetarian", "Keto", "Mediterranean"];
const STATUS_OPTIONS = ["All Status", "completed", "processing", "pending", "cancelled"];

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function OrderHistoryPage() {
  const [search, setSearch] = useState("");
  const [planFilter, setPlanFilter] = useState("All Plans");
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [page, setPage] = useState(1);

  const filtered = ORDERS.filter(o => {
    const matchSearch = !search || o.id.toLowerCase().includes(search.toLowerCase())
      || CUSTOMERS[o.custIdx].name.toLowerCase().includes(search.toLowerCase());
    const matchPlan = planFilter === "All Plans" || o.plan === planFilter;
    const matchStatus = statusFilter === "All Status" || o.status === statusFilter;
    return matchSearch && matchPlan && matchStatus;
  });

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const paged = filtered.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  function clearFilters() {
    setSearch(""); setPlanFilter("All Plans"); setStatusFilter("All Status"); setPage(1);
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <FadeIn className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Order History</h1>
          <p className="mt-0.5 text-sm text-slate-500">Track and manage all completed, cancelled, and refunded orders.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" icon={Filter}>Filters</Button>
          <Button size="sm" icon={Download}>Export History</Button>
        </div>
      </FadeIn>

      {/* Stat cards */}
      <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {STATS.map(s => {
          const Icon = s.icon;
          return (
            <StaggerItem key={s.label}>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className={`mb-2 h-1.5 w-10 rounded-full ${s.color}`} />
                <p className="text-xs font-medium text-slate-500">{s.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
                <p className="mt-0.5 text-[10px] text-slate-400">{s.sub}</p>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Table + sidebar */}
      <SlideUp className="grid grid-cols-1 gap-5 lg:grid-cols-4">
        {/* Table */}
        <div className="lg:col-span-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Filter bar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => { setSearch(e.target.value); setPage(1); }}
                placeholder="Search by ID or customer…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select
              value={planFilter}
              onChange={e => { setPlanFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none"
            >
              {PLAN_OPTIONS.map(o => <option key={o}>{o}</option>)}
            </select>
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value); setPage(1); }}
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 capitalize focus:outline-none"
            >
              {STATUS_OPTIONS.map(o => <option key={o} className="capitalize">{o}</option>)}
            </select>
            <button type="button" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              <Calendar className="h-3.5 w-3.5" />Date Range
            </button>
            {(search || planFilter !== "All Plans" || statusFilter !== "All Status") && (
              <button type="button" onClick={clearFilters} className="text-xs font-medium text-indigo-600 hover:text-indigo-500 transition-colors">
                Clear All
              </button>
            )}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-50 bg-slate-50">
                <tr>
                  {["Order #", "Customer", "Plan", "Date", "Items", "Total", "Payment", "Status", ""].map(h => (
                    <th key={h} className="whitespace-nowrap px-4 py-3 font-semibold text-slate-500">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {paged.map((o, i) => {
                  const cust = CUSTOMERS[o.custIdx];
                  const StatusIcon = STATUS_ICON[o.status];
                  return (
                    <motion.tr
                      key={o.id}
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.04, duration: 0.3 }}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 font-mono font-semibold text-indigo-600">{o.id}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${cust.bg} text-[10px] font-bold text-white`}>
                            {cust.initials}
                          </div>
                          <div className="min-w-0">
                            <p className="truncate font-medium text-slate-900">{cust.name}</p>
                            <p className="truncate text-[10px] text-slate-400">{cust.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-slate-600 whitespace-nowrap">{o.plan}</td>
                      <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{o.date}</td>
                      <td className="px-4 py-3 text-center text-slate-600">{o.items}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{o.total}</td>
                      <td className="px-4 py-3 text-slate-500 whitespace-nowrap">{o.payment}</td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[o.status]}`}>
                          <StatusIcon className="h-2.5 w-2.5" />{o.status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          <motion.button whileHover={{ scale: 1.1 }} type="button" className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100">
                            <Eye className="h-3 w-3" />
                          </motion.button>
                          <motion.button whileHover={{ scale: 1.1 }} type="button" className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100" title="Reorder">
                            <RotateCcw className="h-3 w-3" />
                          </motion.button>
                        </div>
                      </td>
                    </motion.tr>
                  );
                })}
                {paged.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-4 py-10 text-center text-sm text-slate-400">No orders match the current filters.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <span>Showing {paged.length} of {filtered.length} orders</span>
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronLeft className="h-3.5 w-3.5" />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(p => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setPage(p)}
                  className={`h-6 w-6 rounded text-[11px] font-medium transition-colors ${p === page ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}
                >
                  {p}
                </button>
              ))}
              <button
                type="button"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
                className="flex h-6 w-6 items-center justify-center rounded border border-slate-200 disabled:opacity-40 hover:bg-slate-100"
              >
                <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Sidebar: Order overview donut */}
        <div className="flex flex-col gap-4">
          <ScaleIn className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Order History Overview</h2>
            <div className="relative flex items-center justify-center">
              <div className="h-44 w-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={ORDERS_STATUS_DATA} cx="50%" cy="50%" innerRadius={48} outerRadius={70}
                      dataKey="value" paddingAngle={3}>
                      {ORDERS_STATUS_DATA.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-2xl font-bold text-slate-900">{totalPie.toLocaleString()}</p>
                  <p className="text-[10px] text-slate-400">Total</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-2">
              {ORDERS_STATUS_DATA.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                    <span className="text-slate-600">{d.name}</span>
                  </div>
                  <div className="text-right">
                    <span className="font-semibold text-slate-900">{d.value.toLocaleString()}</span>
                    <span className="ml-1 text-[10px] text-slate-400">({Math.round(d.value / totalPie * 100)}%)</span>
                  </div>
                </div>
              ))}
            </div>
          </ScaleIn>

          {/* Quick actions */}
          <SlideUp delay={0.08} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h2 className="mb-3 text-sm font-semibold text-slate-900">Quick Actions</h2>
            <div className="flex flex-col gap-2">
              {[
                { label: "Export All Orders", icon: Download,    variant: "secondary" as const },
                { label: "Refund Selected",   icon: RotateCcw,   variant: "secondary" as const },
                { label: "View Cancelled",    icon: XCircle,     variant: "secondary" as const },
              ].map(a => {
                const Icon = a.icon;
                return (
                  <motion.button
                    key={a.label}
                    whileHover={{ x: 2 }}
                    type="button"
                    className="flex items-center gap-2 rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors text-left"
                  >
                    <Icon className="h-3.5 w-3.5 text-slate-400" />{a.label}
                  </motion.button>
                );
              })}
            </div>
          </SlideUp>
        </div>
      </SlideUp>
    </div>
  );
}
