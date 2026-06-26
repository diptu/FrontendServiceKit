"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import {
  Search, Download, Plus, Package, Clock, CheckCircle2,
  ChefHat, Bike, Star, Filter, Eye, MoreVertical, TrendingUp,
} from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn, SlideUp } from "@/components/ui";
import { Button, Badge } from "@/components/ui";

/* ── Mock data ───────────────────────────────────────────────────────────── */
const STATUS_DATA = [
  { name: "Completed",       value: 36,  pct: "11.0%", color: "#10b981", bg: "bg-emerald-50",  text: "text-emerald-700", border: "border-emerald-200" },
  { name: "Pending",         value: 28,  pct: "8.5%",  color: "#f59e0b", bg: "bg-amber-50",    text: "text-amber-700",   border: "border-amber-200"   },
  { name: "Confirmed",       value: 182, pct: "55.4%", color: "#6366f1", bg: "bg-indigo-50",   text: "text-indigo-700",  border: "border-indigo-200"  },
  { name: "In Preparation",  value: 64,  pct: "19.5%", color: "#8b5cf6", bg: "bg-violet-50",   text: "text-violet-700",  border: "border-violet-200"  },
  { name: "Out for Delivery",value: 18,  pct: "5.5%",  color: "#0ea5e9", bg: "bg-sky-50",      text: "text-sky-700",     border: "border-sky-200"     },
];

const ORDERS = [
  { id: "#ORD-2044", customer: "Alice Wright",   email: "alice.w@nutracorp.test",   location: "Downtown",  plan: "Balanced Plan",    status: "completed",        date: "Jun 26, 2026", total: "$34.50" },
  { id: "#ORD-2043", customer: "Bob Keller",     email: "bob.k@nutracorp.test",     location: "Westside",  plan: "High Protein",     status: "in-preparation",   date: "Jun 26, 2026", total: "$22.00" },
  { id: "#ORD-2042", customer: "Charlie Nguyen", email: "charlie.n@nutracorp.test", location: "Eastside",  plan: "Low Carb",         status: "confirmed",        date: "Jun 25, 2026", total: "$48.75" },
  { id: "#ORD-2041", customer: "Dana Osei",      email: "dana.o@nutracorp.test",    location: "Downtown",  plan: "Vegetarian",       status: "pending",          date: "Jun 25, 2026", total: "$15.00" },
  { id: "#ORD-2040", customer: "Evan Marsh",     email: "evan.m@nutracorp.test",    location: "Northgate", plan: "Balanced Plan",    status: "out-for-delivery", date: "Jun 24, 2026", total: "$29.25" },
  { id: "#ORD-2039", customer: "Fatima Reyes",   email: "fatima.r@nutracorp.test",  location: "Westside",  plan: "High Protein",     status: "completed",        date: "Jun 24, 2026", total: "$44.00" },
  { id: "#ORD-2038", customer: "George Lin",     email: "george.l@nutracorp.test",  location: "Eastside",  plan: "Keto Plan",        status: "confirmed",        date: "Jun 23, 2026", total: "$37.50" },
  { id: "#ORD-2037", customer: "Hana Popov",     email: "hana.p@nutracorp.test",    location: "Downtown",  plan: "Mediterranean",    status: "pending",          date: "Jun 23, 2026", total: "$21.00" },
];

const TOP_MEALS = [
  { rank: 1, name: "Grilled Chicken Salad", orders: 2540, trend: "+12%", emoji: "🥗" },
  { rank: 2, name: "Green Power Plate",     orders: 1890, trend: "+8%",  emoji: "🥦" },
  { rank: 3, name: "Quinoa Veggie Bowl",    orders: 1654, trend: "+5%",  emoji: "🍚" },
  { rank: 4, name: "Protein Boost Meal",    orders: 1423, trend: "-3%",  emoji: "💪" },
  { rank: 5, name: "Avocado Toast",         orders: 1290, trend: "+15%", emoji: "🥑" },
];

const DONUT = [
  { name: "Pending",         value: 28,  color: "#f59e0b" },
  { name: "Confirmed",       value: 182, color: "#6366f1" },
  { name: "In Preparation",  value: 64,  color: "#8b5cf6" },
  { name: "Out for Delivery",value: 18,  color: "#0ea5e9" },
  { name: "Completed",       value: 36,  color: "#10b981" },
];

const STATUS_STYLE: Record<string, string> = {
  completed:          "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending:            "bg-amber-50 text-amber-700 border-amber-200",
  confirmed:          "bg-indigo-50 text-indigo-700 border-indigo-200",
  "in-preparation":   "bg-violet-50 text-violet-700 border-violet-200",
  "out-for-delivery": "bg-sky-50 text-sky-700 border-sky-200",
};

/* ── Stat chip ───────────────────────────────────────────────────────────── */
function StatChip({ icon: Icon, label, count, pct, iconBg }: {
  icon: typeof Package; label: string; count: number; pct: string; iconBg: string;
}) {
  return (
    <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${iconBg}`}>
        <Icon className="h-4 w-4 text-white" />
      </div>
      <div>
        <p className="text-xs font-medium text-slate-500">{label}</p>
        <div className="flex items-baseline gap-1.5">
          <span className="text-lg font-bold text-slate-900">{count}</span>
          <span className="text-[10px] font-medium text-slate-400">{pct}</span>
        </div>
      </div>
    </div>
  );
}

export default function OrdersPage() {
  const [search, setSearch] = useState("");
  const total = DONUT.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Orders</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage and track all meal orders across the organisation.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" icon={Download}>Export Orders</Button>
          <Button size="sm" icon={Plus}>New Order</Button>
        </div>
      </FadeIn>

      {/* Stat chips */}
      <StaggerContainer className="grid grid-cols-2 gap-3 sm:grid-cols-3 xl:grid-cols-6">
        <StaggerItem><StatChip icon={Package}    label="Total Orders"      count={328} pct="100%"  iconBg="bg-slate-600"   /></StaggerItem>
        <StaggerItem><StatChip icon={Clock}      label="Pending"           count={28}  pct="8.5%"  iconBg="bg-amber-500"   /></StaggerItem>
        <StaggerItem><StatChip icon={CheckCircle2} label="Confirmed"       count={182} pct="55.4%" iconBg="bg-indigo-500"  /></StaggerItem>
        <StaggerItem><StatChip icon={ChefHat}    label="In Preparation"    count={64}  pct="19.5%" iconBg="bg-violet-500"  /></StaggerItem>
        <StaggerItem><StatChip icon={Bike}       label="Out for Delivery"  count={18}  pct="5.5%"  iconBg="bg-sky-500"     /></StaggerItem>
        <StaggerItem><StatChip icon={Star}       label="Delivered"         count={36}  pct="11.0%" iconBg="bg-emerald-500" /></StaggerItem>
      </StaggerContainer>

      <SlideUp className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Main table — 3 cols */}
        <div className="xl:col-span-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          {/* Toolbar */}
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
            <div className="relative flex-1 min-w-[180px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search} onChange={e => setSearch(e.target.value)}
                placeholder="Search orders..."
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>Order Type</option><option>Dine-in</option><option>Delivery</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>All Locations</option><option>Downtown</option><option>Westside</option>
            </select>
            <select className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500">
              <option>All Statuses</option><option>Pending</option><option>Completed</option>
            </select>
            <button type="button" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Filter className="h-3.5 w-3.5" />Filters
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-50 bg-slate-50">
                <tr>
                  {["#", "Customer", "Location", "Meal Plan", "Status", "Date", "Total", ""].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {ORDERS.filter(o =>
                  !search || o.customer.toLowerCase().includes(search.toLowerCase()) || o.id.includes(search)
                ).map(o => (
                  <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3 font-mono font-semibold text-indigo-600">{o.id}</td>
                    <td className="px-4 py-3">
                      <p className="font-medium text-slate-900">{o.customer}</p>
                      <p className="text-slate-400">{o.email}</p>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{o.location}</td>
                    <td className="px-4 py-3 text-slate-600">{o.plan}</td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[o.status]}`}>
                        {o.status.replace(/-/g, " ")}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{o.date}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{o.total}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100"><Eye className="h-3.5 w-3.5" /></button>
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100"><MoreVertical className="h-3.5 w-3.5" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <span>Showing {Math.min(ORDERS.length, 8)} of {total} orders</span>
            <div className="flex items-center gap-1">
              {[1,2,3].map(p => (
                <button key={p} type="button" className={`h-6 w-6 rounded text-[11px] ${p === 1 ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>
              ))}
            </div>
          </div>
        </div>

        {/* Sidebar — 2 cols */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Summary */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Order Summary</h3>
            <div className="mt-3 flex flex-col gap-2 text-xs">
              <div className="flex justify-between"><span className="text-slate-500">Grand Total</span><span className="font-semibold text-slate-900">$14,820.50</span></div>
              <div className="flex justify-between"><span className="text-slate-500">Avg Order Value</span><span className="font-semibold text-slate-900">$45.18</span></div>
              <div className="flex justify-between"><span className="text-slate-500">This Week</span><span className="font-semibold text-emerald-600">+$2,340 <TrendingUp className="inline h-3 w-3" /></span></div>
            </div>
          </div>

          {/* Donut */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Orders by Status</h3>
            <div className="relative mt-2 flex justify-center">
              <div className="h-36 w-36">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={DONUT} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {DONUT.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                  <p className="text-lg font-bold text-slate-900">{total}</p>
                  <p className="text-[10px] text-slate-400">Total</p>
                </div>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {DONUT.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="h-2 w-2 rounded-full" style={{ background: d.color }} />
                    <span className="text-slate-600">{d.name}</span>
                  </div>
                  <span className="font-semibold text-slate-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Top meals */}
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Top Meals Ordered</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {TOP_MEALS.map(m => (
                <div key={m.rank} className="flex items-center gap-2.5 px-4 py-2.5">
                  <span className="w-4 text-xs font-bold text-slate-400">#{m.rank}</span>
                  <span className="text-base">{m.emoji}</span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-xs font-medium text-slate-900">{m.name}</p>
                    <p className="text-[10px] text-slate-400">{m.orders.toLocaleString()} orders</p>
                  </div>
                  <span className={`text-[11px] font-semibold ${m.trend.startsWith("+") ? "text-emerald-600" : "text-red-500"}`}>{m.trend}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Button fullWidth size="sm" icon={Plus}>Add New Order</Button>
              <Button fullWidth size="sm" variant="secondary" icon={Download}>Bulk Import Orders</Button>
              <Button fullWidth size="sm" variant="secondary" icon={Download}>Export to CSV</Button>
            </div>
          </div>
        </div>
      </SlideUp>
    </div>
  );
}
