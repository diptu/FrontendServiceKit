"use client";

import { useState } from "react";
import {
  AreaChart, Area, LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
} from "recharts";
import { TrendingUp, TrendingDown, Download, Calendar, Users, ShoppingBag, DollarSign, UtensilsCrossed, BarChart2 } from "lucide-react";
import { motion } from "framer-motion";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem, ScaleIn, SlideIn } from "@/components/ui";
import { Button } from "@/components/ui";

/* ── Data ───────────────────────────────────────────────────────────────── */
const REVENUE_ORDERS = [
  { date: "May 4",  revenue: 8200,  orders: 68  },
  { date: "May 10", revenue: 9800,  orders: 82  },
  { date: "May 16", revenue: 11400, orders: 96  },
  { date: "May 22", revenue: 10200, orders: 88  },
  { date: "May 28", revenue: 13500, orders: 112 },
  { date: "Jun 3",  revenue: 15800, orders: 130 },
  { date: "Jun 9",  revenue: 14200, orders: 118 },
  { date: "Jun 16", revenue: 17600, orders: 146 },
];

const ORDERS_BY_STATUS = [
  { name: "Completed",  value: 224, color: "#6366f1" },
  { name: "Processing", value: 58,  color: "#22c55e" },
  { name: "Pending",    value: 28,  color: "#f59e0b" },
  { name: "Cancelled",  value: 16,  color: "#f43f5e" },
];

const TOP_PLANS = [
  { name: "High Protein",   orders: 2400, color: "#6366f1" },
  { name: "Balanced",       orders: 1980, color: "#818cf8" },
  { name: "Low Carb",       orders: 1500, color: "#a5b4fc" },
  { name: "Vegetarian",     orders: 1200, color: "#22c55e" },
  { name: "Keto",           orders: 900,  color: "#f59e0b" },
  { name: "Mediterranean",  orders: 680,  color: "#f43f5e" },
];

const TOP_MEALS = [
  { rank: 1,  name: "Grilled Chicken & Quinoa", orders: 528, revenue: "$6,600",  trend: "+12%", up: true  },
  { rank: 2,  name: "Green Power Bowl",          orders: 412, revenue: "$4,944",  trend: "+8%",  up: true  },
  { rank: 3,  name: "Salmon Steamed Veggies",    orders: 368, revenue: "$5,888",  trend: "+5%",  up: true  },
  { rank: 4,  name: "Avocado Protein Toast",     orders: 295, revenue: "$2,655",  trend: "-3%",  up: false },
  { rank: 5,  name: "Veggie Buddha Bowl",        orders: 248, revenue: "$2,976",  trend: "+15%", up: true  },
];

const ORDERS_BY_DAY = [
  { day: "Mon", orders: 182 }, { day: "Tue", orders: 165 }, { day: "Wed", orders: 192 },
  { day: "Thu", orders: 210 }, { day: "Fri", orders: 248 }, { day: "Sat", orders: 198 },
  { day: "Sun", orders: 156 },
];

const LOCATIONS = [
  { name: "Downtown",    orders: 842,  revenue: "$10,524", completion: "97.2%" },
  { name: "Westside",    orders: 614,  revenue: "$7,368",  completion: "95.8%" },
  { name: "Eastside",    orders: 548,  revenue: "$6,576",  completion: "96.4%" },
  { name: "Northgate",   orders: 412,  revenue: "$4,944",  completion: "94.1%" },
  { name: "South Bay",   orders: 286,  revenue: "$3,432",  completion: "93.5%" },
];

const CUSTOMER_GROWTH = [
  { month: "Jan", new: 48, total: 820 }, { month: "Feb", new: 62, total: 882 },
  { month: "Mar", new: 55, total: 937 }, { month: "Apr", new: 78, total: 1015 },
  { month: "May", new: 88, total: 1103 }, { month: "Jun", new: 72, total: 1175 },
];

const RETENTION = [
  { month: "Jan", rate: 88 }, { month: "Feb", rate: 86 }, { month: "Mar", rate: 91 },
  { month: "Apr", rate: 89 }, { month: "May", rate: 93 }, { month: "Jun", rate: 94 },
];

const SEGMENTS = [
  { name: "Premium",    value: 38, color: "#6366f1" },
  { name: "Standard",   value: 44, color: "#22c55e" },
  { name: "Basic",      value: 18, color: "#f59e0b" },
];

const STATS = [
  { label: "Total Orders",     value: "2,702", change: "+8.4%",  up: true,  icon: ShoppingBag,    color: "bg-indigo-500",  iconBg: "bg-indigo-50",  iconColor: "text-indigo-600"  },
  { label: "Total Revenue",    value: "$14,563", change: "+12.1%", up: true,  icon: DollarSign,   color: "bg-emerald-500", iconBg: "bg-emerald-50", iconColor: "text-emerald-600" },
  { label: "Total Items",      value: "8,312",  change: "+6.7%",  up: true,  icon: UtensilsCrossed,color:"bg-violet-500",  iconBg: "bg-violet-50",  iconColor: "text-violet-600"  },
  { label: "Active Members",   value: "312",    change: "+4.2%",  up: true,  icon: Users,         color: "bg-sky-500",     iconBg: "bg-sky-50",     iconColor: "text-sky-600"     },
  { label: "Avg Order Value",  value: "$112",   change: "+3.7%",  up: true,  icon: BarChart2,     color: "bg-amber-500",   iconBg: "bg-amber-50",   iconColor: "text-amber-600"   },
  { label: "Avg Meal Plans",   value: "44.47",  change: "-0.8%",  up: false, icon: Calendar,      color: "bg-rose-500",    iconBg: "bg-rose-50",    iconColor: "text-rose-600"    },
];

const totalOrders = ORDERS_BY_STATUS.reduce((s, d) => s + d.value, 0);

/* ── Reusable RACI label ───────────────────────────────────────────────── */
function SectionLabel({ children }: { children: React.ReactNode }) {
  return <h2 className="mb-4 text-sm font-semibold text-slate-900">{children}</h2>;
}

/* ── Page ───────────────────────────────────────────────────────────────── */
export default function AnalyticsPage() {
  const [range, setRange] = useState("May 4 – Jun 16, 2026");

  return (
    <div className="flex flex-col gap-6">
      {/* Header */}
      <FadeIn className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
          <p className="mt-0.5 text-sm text-slate-500">Deep insights into your meal service performance and trends.</p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <button type="button" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
            <Calendar className="h-3.5 w-3.5" />{range}
          </button>
          <Button size="sm" icon={Download}>Export Analytics</Button>
        </div>
      </FadeIn>

      {/* Stat cards */}
      <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
        {STATS.map((s) => {
          const Icon = s.icon;
          return (
            <StaggerItem key={s.label}>
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className={`mb-3 flex h-9 w-9 items-center justify-center rounded-xl ${s.iconBg}`}>
                  <Icon className={`h-4 w-4 ${s.iconColor}`} />
                </div>
                <p className="text-xs font-medium text-slate-500">{s.label}</p>
                <p className="mt-1 text-xl font-bold text-slate-900">{s.value}</p>
                <div className={`mt-1 flex items-center gap-1 text-[11px] font-medium ${s.up ? "text-emerald-600" : "text-red-500"}`}>
                  {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                  {s.change} vs last period
                </div>
              </div>
            </StaggerItem>
          );
        })}
      </StaggerContainer>

      {/* Row 1: Revenue/Orders chart + Status donut */}
      <SlideUp className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <SectionLabel>Orders &amp; Revenue Over Time</SectionLabel>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-600">Live</span>
          </div>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE_ORDERS} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <defs>
                <linearGradient id="aRev" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                </linearGradient>
                <linearGradient id="aOrd" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#22c55e" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#22c55e" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis yAxisId="rev" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
              <YAxis yAxisId="ord" orientation="right" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area yAxisId="rev" type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#aRev)" name="Revenue ($)" />
              <Area yAxisId="ord" type="monotone" dataKey="orders"  stroke="#22c55e" strokeWidth={2} fill="url(#aOrd)" name="Orders" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionLabel>Orders by Status</SectionLabel>
          <ScaleIn className="relative flex items-center justify-center">
            <div className="h-44 w-44">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={ORDERS_BY_STATUS} cx="50%" cy="50%" innerRadius={50} outerRadius={72}
                    dataKey="value" paddingAngle={3}>
                    {ORDERS_BY_STATUS.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <p className="text-2xl font-bold text-slate-900">{totalOrders}</p>
                <p className="text-[10px] text-slate-400">Total</p>
              </div>
            </div>
          </ScaleIn>
          <div className="mt-3 flex flex-col gap-2">
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

      {/* Row 2: Top plans bar + Top meals table */}
      <SlideUp delay={0.04} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionLabel>Top Meal Plans by Orders</SectionLabel>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={TOP_PLANS} layout="vertical" margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="name" type="category" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={96} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="orders" fill="#6366f1" radius={[0, 4, 4, 0]}>
                {TOP_PLANS.map((p, i) => (
                  <Cell key={i} fill={p.color} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Top Meals by Orders</h2>
          </div>
          <table className="w-full text-xs">
            <thead className="border-b border-slate-50 bg-slate-50">
              <tr>
                {["#", "Meal", "Orders", "Revenue", "Trend"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {TOP_MEALS.map((m) => (
                <motion.tr
                  key={m.rank}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: m.rank * 0.05, duration: 0.35 }}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-3 font-bold text-slate-400">#{m.rank}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{m.name}</td>
                  <td className="px-4 py-3 text-slate-600">{m.orders.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{m.revenue}</td>
                  <td className={`px-4 py-3 font-semibold ${m.up ? "text-emerald-600" : "text-red-500"}`}>
                    <span className="flex items-center gap-1">
                      {m.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                      {m.trend}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SlideUp>

      {/* Row 3: Orders by day + Location performance */}
      <SlideUp delay={0.06} className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionLabel>Orders by Day of Week</SectionLabel>
          <ResponsiveContainer width="100%" height={180}>
            <BarChart data={ORDERS_BY_DAY} margin={{ top: 4, right: 4, bottom: 0, left: -10 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
              <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="orders" fill="#6366f1" radius={[4, 4, 0, 0]}>
                {ORDERS_BY_DAY.map((_, i) => (
                  <Cell key={i} fill={i === 4 ? "#6366f1" : "#a5b4fc"} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="lg:col-span-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Location Performance</h2>
          </div>
          <table className="w-full text-xs">
            <thead className="border-b border-slate-50 bg-slate-50">
              <tr>
                {["Location", "Total Orders", "Revenue", "Completion"].map(h => (
                  <th key={h} className="px-4 py-2.5 text-left font-semibold text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {LOCATIONS.map((l, i) => (
                <motion.tr
                  key={l.name}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.06, duration: 0.4 }}
                  className="hover:bg-slate-50/60 transition-colors"
                >
                  <td className="px-4 py-3 font-medium text-slate-900">{l.name}</td>
                  <td className="px-4 py-3 text-slate-600">{l.orders.toLocaleString()}</td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{l.revenue}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700 border border-emerald-200">
                      {l.completion}
                    </span>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </SlideUp>

      {/* Row 4: Customer growth + Retention + Segments */}
      <SlideUp delay={0.08} className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionLabel>Customer Growth</SectionLabel>
          <ResponsiveContainer width="100%" height={160}>
            <AreaChart data={CUSTOMER_GROWTH} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <defs>
                <linearGradient id="aCG" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Area type="monotone" dataKey="total" stroke="#6366f1" strokeWidth={2} fill="url(#aCG)" name="Total Members" />
              <Line type="monotone" dataKey="new" stroke="#22c55e" strokeWidth={2} dot={false} name="New Members" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionLabel>Customer Retention</SectionLabel>
          <ResponsiveContainer width="100%" height={160}>
            <LineChart data={RETENTION} margin={{ top: 4, right: 4, bottom: 0, left: -16 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} domain={[80, 100]} tickFormatter={v => `${v}%`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v) => [`${v}%`, "Retention"]} />
              <Line type="monotone" dataKey="rate" stroke="#6366f1" strokeWidth={2.5} dot={{ r: 4, fill: "#6366f1" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <SectionLabel>Customer Segments</SectionLabel>
          <ScaleIn delay={0.1} className="flex flex-col items-center gap-4">
            <div className="h-36 w-36">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={SEGMENTS} cx="50%" cy="50%" innerRadius={36} outerRadius={58} dataKey="value" paddingAngle={3}>
                    {SEGMENTS.map((d, i) => <Cell key={i} fill={d.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8 }} formatter={(v) => [`${v}%`, ""]} />
                </PieChart>
              </ResponsiveContainer>
            </div>
            <div className="w-full flex flex-col gap-1.5">
              {SEGMENTS.map(s => (
                <div key={s.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 shrink-0 rounded-full" style={{ background: s.color }} />
                    <span className="text-slate-600">{s.name}</span>
                  </div>
                  <span className="font-bold text-slate-900">{s.value}%</span>
                </div>
              ))}
            </div>
          </ScaleIn>
        </div>
      </SlideUp>

      {/* Data Summary */}
      <SlideUp delay={0.1}>
        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-4 py-3">
            <h2 className="text-sm font-semibold text-slate-900">Data Summary</h2>
          </div>
          <div className="grid grid-cols-2 divide-x divide-slate-100 sm:grid-cols-4">
            {[
              { label: "Peak Revenue Day",  val: "Jun 16, 2026",  sub: "$17,600" },
              { label: "Most Popular Plan", val: "High Protein",   sub: "2,400 orders" },
              { label: "Growth Rate",       val: "+12.1%",         sub: "vs last period" },
              { label: "Avg Daily Orders",  val: "90",             sub: "per day" },
            ].map((item, i) => (
              <motion.div
                key={item.label}
                initial={{ opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.07, duration: 0.4 }}
                className="p-4"
              >
                <p className="text-xs font-medium text-slate-500">{item.label}</p>
                <p className="mt-1 text-base font-bold text-slate-900">{item.val}</p>
                <p className="mt-0.5 text-[11px] text-slate-400">{item.sub}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </SlideUp>
    </div>
  );
}
