"use client";

import { AreaChart, Area, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, Download } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn, SlideUp } from "@/components/ui";
import { Button } from "@/components/ui";

const REVENUE = [
  { month: "Jan", revenue: 38000, orders: 420 }, { month: "Feb", revenue: 42000, orders: 480 },
  { month: "Mar", revenue: 39000, orders: 445 }, { month: "Apr", revenue: 51000, orders: 560 },
  { month: "May", revenue: 48000, orders: 520 }, { month: "Jun", revenue: 57000, orders: 630 },
];

const CATEGORY_SALES = [
  { category: "High Protein", sales: 2400 }, { category: "Balanced",    sales: 1980 },
  { category: "Low Carb",     sales: 1500 }, { category: "Vegetarian",  sales: 1200 },
  { category: "Keto",         sales: 900  }, { category: "Mediterranean",sales: 680 },
];

const STATS = [
  { label: "Total Revenue",    value: "$275K", change: "+12.4%", up: true,  color: "bg-indigo-500"  },
  { label: "Total Orders",     value: "3,055", change: "+8.2%",  up: true,  color: "bg-emerald-500" },
  { label: "Avg Order Value",  value: "$90",   change: "+3.7%",  up: true,  color: "bg-violet-500"  },
  { label: "Churn Rate",       value: "4.2%",  change: "-0.8%",  up: false, color: "bg-rose-500"    },
];

export default function AnalyticsPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Analytics</h1>
          <p className="mt-0.5 text-sm text-slate-500">Performance metrics and trends across the meal service.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 focus:outline-none">
            {["Last 6 Months", "Last 30 Days", "Last Year"].map(o => <option key={o}>{o}</option>)}
          </select>
          <Button variant="secondary" size="sm" icon={Download}>Export Report</Button>
        </div>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map(s => (
          <StaggerItem key={s.label}>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`mb-2 h-1.5 w-10 rounded-full ${s.color}`} />
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
              <div className={`mt-1 flex items-center gap-1 text-xs font-medium ${s.up ? "text-emerald-600" : "text-red-500"}`}>
                {s.up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
                {s.change} vs last period
              </div>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <SlideUp className="grid grid-cols-1 gap-5 lg:grid-cols-3">
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Revenue & Orders Trend</h2>
          <ResponsiveContainer width="100%" height={220}>
            <AreaChart data={REVENUE}>
              <defs>
                <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.18} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.01} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} tickFormatter={v => `$${(v/1000).toFixed(0)}k`} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
              <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2} fill="url(#colorRevenue)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Sales by Plan Category</h2>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={CATEGORY_SALES} layout="vertical" margin={{ left: 0, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" horizontal={false} />
              <XAxis type="number" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis dataKey="category" type="category" tick={{ fontSize: 10, fill: "#64748b" }} axisLine={false} tickLine={false} width={90} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Bar dataKey="sales" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </SlideUp>

      <SlideUp delay={0.06} className="grid grid-cols-1 gap-5 lg:grid-cols-2">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-4 text-sm font-semibold text-slate-900">Monthly Orders</h2>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={REVENUE}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="month" tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
              <Line type="monotone" dataKey="orders" stroke="#10b981" strokeWidth={2} dot={{ r: 4, fill: "#10b981" }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="mb-3 text-sm font-semibold text-slate-900">Key Insights</h2>
          <div className="flex flex-col gap-3">
            {[
              { label: "Peak Revenue Month", val: "June 2026", sub: "$57,000" },
              { label: "Most Popular Plan",  val: "High Protein", sub: "2,400 orders" },
              { label: "Growth Rate",        val: "+12.4%", sub: "vs last period" },
              { label: "Avg Daily Orders",   val: "102",   sub: "per day" },
            ].map(i => (
              <div key={i.label} className="flex items-center justify-between rounded-lg border border-slate-100 px-3 py-2.5">
                <span className="text-xs font-medium text-slate-600">{i.label}</span>
                <div className="text-right">
                  <p className="text-xs font-bold text-slate-900">{i.val}</p>
                  <p className="text-[10px] text-slate-400">{i.sub}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </SlideUp>
    </div>
  );
}
