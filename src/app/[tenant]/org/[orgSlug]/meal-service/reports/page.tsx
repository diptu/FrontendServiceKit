"use client";

import { useState } from "react";
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import {
  FileText, BarChart2, Users, Package, Download, RefreshCw,
  Calendar, TrendingUp, TrendingDown, Plus, Settings,
  ShoppingBag, DollarSign, UtensilsCrossed,
} from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn } from "@/components/ui";
import { Button } from "@/components/ui";

/* ── Data ───────────────────────────────────────────────────────────────── */
const REVENUE_TREND = [
  { date: "May 4",  revenue: 8200, orders: 68 }, { date: "May 10", revenue: 9800,  orders: 82 },
  { date: "May 16", revenue: 11400, orders: 96 }, { date: "May 22", revenue: 10200, orders: 88 },
  { date: "May 28", revenue: 13500, orders: 112 }, { date: "Jun 3",  revenue: 15800, orders: 130 },
  { date: "Jun 9",  revenue: 14200, orders: 118 }, { date: "Jun 16", revenue: 17600, orders: 146 },
];

const ORDERS_BY_STATUS = [
  { name: "Completed",  value: 224, color: "#6366f1" },
  { name: "Processing", value: 58,  color: "#22c55e" },
  { name: "Pending",    value: 28,  color: "#f59e0b" },
  { name: "Cancelled",  value: 16,  color: "#f43f5e" },
];

const TOP_PLANS = [
  { name: "High Protein",  revenue: 24000 }, { name: "Balanced",      revenue: 19800 },
  { name: "Low Carb",      revenue: 15000 }, { name: "Vegetarian",    revenue: 12000 },
  { name: "Keto",          revenue: 9000  }, { name: "Mediterranean", revenue: 6800  },
];

const TOP_MEALS = [
  { rank: 1, name: "Grilled Chicken & Quinoa", orders: 528, revenue: "$6,600", trend: "+12%", up: true  },
  { rank: 2, name: "Green Power Bowl",          orders: 412, revenue: "$4,944", trend: "+8%",  up: true  },
  { rank: 3, name: "Salmon Steamed Veggies",    orders: 368, revenue: "$5,888", trend: "+5%",  up: true  },
  { rank: 4, name: "Avocado Protein Toast",     orders: 295, revenue: "$2,655", trend: "-3%",  up: false },
  { rank: 5, name: "Veggie Buddha Bowl",        orders: 248, revenue: "$2,976", trend: "+15%", up: true  },
];

const TOP_LOCATIONS = [
  { name: "Downtown",  revenue: "$10,524", orders: 842 },
  { name: "Westside",  revenue: "$7,368",  orders: 614 },
  { name: "Eastside",  revenue: "$6,576",  orders: 548 },
  { name: "Northgate", revenue: "$4,944",  orders: 412 },
];

const REVENUE_SUMMARY = [
  { period: "May 4–10, 2026",   rev: "$14,165.75", sub: "$11,250.00", add: "$785.00",  deduct: "$312.25", net: "$15,640.25" },
  { period: "May 11–17, 2026",  rev: "$11,200.50", sub: "$9,800.00",  add: "$620.50",  deduct: "$205.00", net: "$11,616.00" },
  { period: "May 18–31, 2026",  rev: "$16,842.00", sub: "$13,500.00", add: "$920.00",  deduct: "$418.00", net: "$14,002.00" },
];

const REPORT_TEMPLATES = [
  { icon: BarChart2, title: "Revenue Summary",   desc: "Revenue breakdown by plan, period, and segment.", generated: "Jun 25, 2026", iconBg: "bg-indigo-50",  iconColor: "text-indigo-600"  },
  { icon: Users,     title: "Customer Report",   desc: "Acquisition, retention, churn, and LTV analysis.", generated: "Jun 24, 2026", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { icon: Package,   title: "Orders Report",     desc: "Volume, fulfilment rates, and delivery performance.", generated: "Jun 26, 2026", iconBg: "bg-violet-50",  iconColor: "text-violet-600"  },
  { icon: FileText,  title: "Nutrition Report",  desc: "Aggregate nutrition data across all delivered meals.", generated: "Jun 22, 2026", iconBg: "bg-amber-50",   iconColor: "text-amber-600"   },
];

const STATS = [
  { label: "Total Orders",    value: "2,702",  change: "+8.4%",  up: true,  icon: ShoppingBag     },
  { label: "Total Revenue",   value: "$14,563",change: "+12.1%", up: true,  icon: DollarSign      },
  { label: "Total Items",     value: "8,312",  change: "+6.7%",  up: true,  icon: UtensilsCrossed },
  { label: "Active Members",  value: "312",    change: "+4.2%",  up: true,  icon: Users           },
  { label: "Avg Order Value", value: "$112",   change: "+3.7%",  up: true,  icon: BarChart2       },
  { label: "Avg Meal Plans",  value: "44.47",  change: "-0.8%",  up: false, icon: Calendar        },
];

const totalOrders = ORDERS_BY_STATUS.reduce((s, d) => s + d.value, 0);

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState<"overview" | "templates" | "custom">("overview");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <FadeIn className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports</h1>
          <p className="mt-0.5 text-sm text-slate-500">Analyze meal service performance and operational metrics.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Calendar className="h-3.5 w-3.5" />May 4 – Jun 16, 2026
          </button>
          <Button size="sm" icon={Download}>Export Report</Button>
        </div>
      </FadeIn>

      {/* Stat cards */}
      <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {STATS.map(s => {
          const Icon = s.icon;
          return (
            <StaggerItem key={s.label}>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-50">
                  <Icon className="h-4 w-4 text-indigo-600" />
                </div>
                <p className="text-xs font-medium text-slate-500">{s.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
                <div className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${s.up ? "text-emerald-600" : "text-red-500"}`}>
                  {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.change}
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Tabs */}
      <FadeIn>
        <div className="flex items-center gap-1 rounded-xl border border-slate-200 bg-white p-1 shadow-sm w-fit">
          {(["overview", "templates", "custom"] as const).map(tab => (
            <motion.button
              key={tab}
              type="button"
              onClick={() => setActiveTab(tab)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold capitalize transition-colors ${
                activeTab === tab ? "bg-indigo-600 text-white shadow-sm" : "text-slate-600 hover:bg-slate-50"
              }`}
            >
              {tab === "custom" ? "Custom Reports" : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </motion.button>
          ))}
        </div>
      </FadeIn>

      {activeTab === "overview" && (
        <>
          {/* Orders & Revenue + Status donut */}
          <SlideUp className="grid grid-cols-1 gap-5 lg:grid-cols-3">
            <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Orders &amp; Revenue Over Time</h2>
              <ResponsiveContainer width="100%" height={220}>
                <AreaChart data={REVENUE_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
                  <defs>
                    <linearGradient id="rRev" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Legend wrapperStyle={{ fontSize: 11 }} />
                  <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#rRev)" name="Revenue ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-2 text-sm font-semibold text-slate-900">Orders by Status</h2>
              <ScaleIn className="relative flex items-center justify-center">
                <div className="h-44 w-44">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie data={ORDERS_BY_STATUS} cx="50%" cy="50%" innerRadius={50} outerRadius={72} dataKey="value" paddingAngle={3}>
                        {ORDERS_BY_STATUS.map((d, i) => <Cell key={i} fill={d.color} />)}
                      </Pie>
                      <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                    <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
                    <p className="text-[10px] text-slate-400">Total</p>
                  </div>
                </div>
              </ScaleIn>
              <div className="mt-3 flex flex-col gap-1.5">
                {ORDERS_BY_STATUS.map(d => (
                  <div key={d.name} className="flex items-center justify-between text-xs">
                    <div className="flex items-center gap-2">
                      <span className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ background: d.color }} />
                      <span className="text-slate-600">{d.name}</span>
                    </div>
                    <span className="font-semibold text-slate-900">{d.value}</span>
                  </div>
                ))}
              </div>
            </div>
          </SlideUp>

          {/* Top plans + Top meals */}
          <SlideUp delay={0.04} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
              <h2 className="mb-4 text-sm font-semibold text-slate-900">Top Meal Plans by Revenue</h2>
              <ResponsiveContainer width="100%" height={200}>
                <BarChart data={TOP_PLANS} layout="vertical" margin={{ left: 0, right: 8 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
                  <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
                  <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={96} />
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
                  <Bar dataKey="revenue" fill="#6366f1" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>

            <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3">
                <h2 className="text-sm font-semibold text-slate-900">Top Locations by Revenue</h2>
              </div>
              <table className="w-full text-xs">
                <thead className="border-b border-slate-50 bg-slate-50">
                  <tr>
                    {["Location", "Revenue", "Orders"].map(h => (
                      <th key={h} className="px-4 py-2.5 text-left font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {TOP_LOCATIONS.map((l, i) => (
                    <motion.tr
                      key={l.name}
                      initial={{ opacity: 0, x: -6 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-900">{l.name}</td>
                      <td className="px-4 py-3 font-semibold text-slate-900">{l.revenue}</td>
                      <td className="px-4 py-3 text-slate-600">{l.orders}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
              <div className="border-t border-slate-100 px-4 py-3">
                <h3 className="mb-2 text-xs font-semibold text-slate-700">Top Meals by Orders</h3>
                <div className="flex flex-col gap-1">
                  {TOP_MEALS.slice(0, 3).map(m => (
                    <div key={m.rank} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">#{m.rank} {m.name}</span>
                      <span className={`font-semibold ${m.up ? "text-emerald-600" : "text-red-500"}`}>{m.trend}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </SlideUp>

          {/* Revenue summary */}
          <SlideUp delay={0.06} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3">
              <h2 className="text-sm font-semibold text-slate-900">Revenue Summary</h2>
              <Button variant="secondary" size="sm" icon={Download}>Download CSV</Button>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead className="border-b border-slate-50 bg-slate-50">
                  <tr>
                    {["Period", "Gross Revenue", "Subscription", "Add-ons", "Deductions", "Net Revenue"].map(h => (
                      <th key={h} className="whitespace-nowrap px-4 py-3 text-left font-semibold text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-50">
                  {REVENUE_SUMMARY.map((r, i) => (
                    <motion.tr
                      key={r.period}
                      initial={{ opacity: 0, y: 4 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.07 }}
                      className="hover:bg-slate-50/60 transition-colors"
                    >
                      <td className="px-4 py-3 font-medium text-slate-700 whitespace-nowrap">{r.period}</td>
                      <td className="px-4 py-3 text-slate-600">{r.rev}</td>
                      <td className="px-4 py-3 text-slate-600">{r.sub}</td>
                      <td className="px-4 py-3 text-emerald-700 font-medium">{r.add}</td>
                      <td className="px-4 py-3 text-red-500">{r.deduct}</td>
                      <td className="px-4 py-3 font-bold text-slate-900">{r.net}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </SlideUp>
        </>
      )}

      {activeTab === "templates" && (
        <SlideUp className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          {REPORT_TEMPLATES.map(r => {
            const Icon = r.icon;
            return (
              <motion.div
                key={r.title}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                whileHover={{ y: -2, boxShadow: "0 8px 16px -4px rgb(0 0 0 / 0.08)" }}
                className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow"
              >
                <div className="flex items-center gap-3">
                  <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${r.iconBg}`}>
                    <Icon className={`h-5 w-5 ${r.iconColor}`} />
                  </div>
                  <div className="min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900">{r.title}</h3>
                    <p className="text-[11px] text-slate-400">Last generated {r.generated}</p>
                  </div>
                </div>
                <p className="text-xs text-slate-500 leading-relaxed">{r.desc}</p>
                <div className="flex items-center gap-2 mt-auto">
                  <Button fullWidth size="sm" variant="secondary" icon={RefreshCw}>Generate</Button>
                  <Button fullWidth size="sm" icon={Download}>Download</Button>
                </div>
              </motion.div>
            );
          })}
        </SlideUp>
      )}

      {activeTab === "custom" && (
        <SlideUp className="flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-sm font-semibold text-slate-900">Custom Reports</h2>
                <p className="mt-0.5 text-xs text-slate-400">Build and save your own report configurations.</p>
              </div>
              <Button size="sm" icon={Plus}>New Report</Button>
            </div>
            <div className="flex flex-col gap-3">
              {[
                { name: "Weekly Revenue Digest",    schedule: "Every Monday 8:00 AM",  format: "PDF",  status: "active" },
                { name: "Monthly Member Summary",   schedule: "1st of month 9:00 AM",  format: "CSV",  status: "active" },
                { name: "Quarterly Nutrition Audit",schedule: "Jan, Apr, Jul, Oct 1st", format: "PDF",  status: "paused" },
              ].map((r, i) => (
                <motion.div
                  key={r.name}
                  initial={{ opacity: 0, x: -8 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: i * 0.07 }}
                  className="flex items-center justify-between rounded-xl border border-slate-100 bg-slate-50 px-4 py-3.5"
                >
                  <div>
                    <p className="text-xs font-semibold text-slate-900">{r.name}</p>
                    <p className="mt-0.5 text-[11px] text-slate-400">{r.schedule} · {r.format}</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${r.status === "active" ? "border-emerald-200 bg-emerald-50 text-emerald-700" : "border-slate-200 bg-white text-slate-500"}`}>
                      {r.status}
                    </span>
                    <button type="button" className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
                      <Settings className="h-3.5 w-3.5" />
                    </button>
                    <button type="button" className="rounded-lg border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-100 transition-colors">
                      <Download className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </SlideUp>
      )}
    </div>
  );
}
