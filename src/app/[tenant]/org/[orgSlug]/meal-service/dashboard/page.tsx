"use client";

import {
  AreaChart, Area, LineChart, Line, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from "recharts";
import {
  ShoppingBag, DollarSign, UtensilsCrossed, Users, Clock,
  TrendingUp, TrendingDown, AlertTriangle, Bike, Star,
  CheckCircle, Flame, Dumbbell, Wheat, MapPin, ChevronRight,
} from "lucide-react";
import { usePreviewUser } from "@/components/org/PreviewUserContext";

/* ── Chart data ────────────────────────────────────────────────────────── */
const ORDER_TREND = [
  { day: "Jun 13", orders: 142, prev: 128 },
  { day: "Jun 14", orders: 165, prev: 140 },
  { day: "Jun 15", orders: 138, prev: 145 },
  { day: "Jun 16", orders: 190, prev: 155 },
  { day: "Jun 17", orders: 175, prev: 160 },
  { day: "Jun 18", orders: 220, prev: 178 },
  { day: "Jun 19", orders: 198, prev: 182 },
  { day: "Jun 20", orders: 245, prev: 190 },
  { day: "Jun 21", orders: 180, prev: 195 },
  { day: "Jun 22", orders: 210, prev: 198 },
  { day: "Jun 23", orders: 195, prev: 202 },
  { day: "Jun 24", orders: 230, prev: 210 },
  { day: "Jun 25", orders: 215, prev: 218 },
  { day: "Jun 26", orders: 260, prev: 225 },
];

const REVENUE_TREND = [
  { month: "Jan", revenue: 32000 },
  { month: "Feb", revenue: 38500 },
  { month: "Mar", revenue: 42000 },
  { month: "Apr", revenue: 39800 },
  { month: "May", revenue: 45200 },
  { month: "Jun", revenue: 48750 },
];

const ORDERS_BY_STATUS = [
  { name: "Completed",  value: 1842, color: "#6366f1" },
  { name: "Processing", value: 456,  color: "#818cf8" },
  { name: "Pending",    value: 156,  color: "#a5b4fc" },
  { name: "Cancelled",  value: 114,  color: "#e2e8f0" },
];

const TOP_MEALS = [
  { name: "Grilled Chicken Salad", orders: 2540, revenue: "$31,750", trend: "+12%", up: true,  emoji: "🥗", color: "bg-emerald-100" },
  { name: "Green Power Plate",     orders: 1890, revenue: "$26,460", trend: "+8%",  up: true,  emoji: "🥦", color: "bg-lime-100"    },
  { name: "Quinoa Veggie Bowl",    orders: 1654, revenue: "$19,022", trend: "+5%",  up: true,  emoji: "🍚", color: "bg-amber-100"   },
  { name: "Protein Boost Meal",    orders: 1423, revenue: "$22,056", trend: "-3%",  up: false, emoji: "💪", color: "bg-sky-100"     },
  { name: "Avocado Toast",         orders: 1290, revenue: "$12,255", trend: "+15%", up: true,  emoji: "🥑", color: "bg-green-100"   },
];

const RECENT_ORDERS = [
  { id: "#ORD-1044", customer: "Alice Wright",   date: "Jun 26, 2026", status: "completed",  total: "$34.50", items: 3 },
  { id: "#ORD-1043", customer: "Bob Keller",     date: "Jun 26, 2026", status: "processing", total: "$22.00", items: 2 },
  { id: "#ORD-1042", customer: "Charlie Nguyen", date: "Jun 25, 2026", status: "pending",    total: "$48.75", items: 4 },
  { id: "#ORD-1041", customer: "Dana Osei",      date: "Jun 25, 2026", status: "completed",  total: "$15.00", items: 1 },
  { id: "#ORD-1040", customer: "Evan Marsh",     date: "Jun 24, 2026", status: "cancelled",  total: "$29.25", items: 3 },
];

const INVENTORY_ALERTS = [
  { item: "Chicken Breast",  level: 12, unit: "kg",  severity: "critical" },
  { item: "Brown Rice",      level: 28, unit: "kg",  severity: "warning"  },
  { item: "Olive Oil",       level: 6,  unit: "L",   severity: "critical" },
  { item: "Seasonal Greens", level: 45, unit: "kg",  severity: "ok"       },
];

const ACTIVE_KITCHENS = [
  { name: "Downtown Kitchen",    orders: 84, capacity: 90, status: "busy"     },
  { name: "Westside Prep",       orders: 52, capacity: 80, status: "normal"   },
  { name: "Eastside Central",    orders: 71, capacity: 85, status: "busy"     },
  { name: "Northgate Express",   orders: 38, capacity: 60, status: "normal"   },
];

const PENDING_REVIEWS = [
  { reviewer: "Fatima Reyes",  meal: "Grilled Chicken Salad", rating: 4, date: "1 hr ago"  },
  { reviewer: "George Lin",    meal: "Quinoa Veggie Bowl",    rating: 5, date: "2 hr ago"  },
  { reviewer: "Hana Popov",    meal: "Protein Boost Meal",   rating: 3, date: "3 hr ago"  },
];

/* Member data */
const MY_MEAL_SCHEDULE = [
  { slot: "Breakfast", time: "8:00 AM",  name: "Overnight Oats & Berries",       cal: 420, emoji: "🥣", status: "delivered" },
  { slot: "Lunch",     time: "12:30 PM", name: "Grilled Chicken & Green Tea",    cal: 580, emoji: "🥗", status: "out-for-delivery" },
  { slot: "Dinner",    time: "7:00 PM",  name: "Salmon & Steamed Vegetables",    cal: 650, emoji: "🍣", status: "preparing" },
];

const NUTRITION = [
  { label: "Calories",  icon: Flame,    current: 1850, target: 2400, unit: "kcal", color: "bg-orange-500", pct: 77 },
  { label: "Protein",   icon: Dumbbell, current: 92,   target: 150,  unit: "g",    color: "bg-indigo-500", pct: 61 },
  { label: "Carbs",     icon: Wheat,    current: 210,  target: 300,  unit: "g",    color: "bg-amber-500",  pct: 70 },
];

const RECOMMENDED_MEALS = [
  { name: "Mediterranean Bowl",   cal: 490, price: "$13.50", rating: 4.8, emoji: "🥙", color: "from-amber-100 to-orange-50"  },
  { name: "Salmon Power Plate",   cal: 620, price: "$16.00", rating: 4.9, emoji: "🍣", color: "from-sky-100 to-blue-50"      },
  { name: "Quinoa Veggie Curry",  cal: 410, price: "$12.00", rating: 4.7, emoji: "🍛", color: "from-lime-100 to-green-50"    },
];

const MY_RECENT_ORDERS = [
  { id: "#ORD-1038", name: "Grilled Chicken Salad", date: "Jun 24, 2026", status: "delivered", total: "$12.50" },
  { id: "#ORD-1029", name: "Green Power Plate",     date: "Jun 22, 2026", status: "delivered", total: "$14.00" },
  { id: "#ORD-1018", name: "Protein Boost Meal",    date: "Jun 20, 2026", status: "delivered", total: "$15.50" },
];

/* ── Shared components ─────────────────────────────────────────────────── */
const ORDER_STATUS_STYLES: Record<string, string> = {
  completed:  "bg-emerald-50 text-emerald-700",
  processing: "bg-indigo-50 text-indigo-700",
  pending:    "bg-amber-50 text-amber-700",
  cancelled:  "bg-red-50 text-red-700",
  delivered:  "bg-emerald-50 text-emerald-700",
  "out-for-delivery": "bg-sky-50 text-sky-700",
  preparing:  "bg-amber-50 text-amber-700",
};

function StatCard({
  icon: Icon, label, value, sub, iconBg, trend, up,
}: {
  icon: typeof ShoppingBag; label: string; value: string; sub?: string;
  iconBg: string; trend?: string; up?: boolean;
}) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-xl ${iconBg}`}>
        <Icon className="h-5 w-5 text-white" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-xs font-medium text-slate-500">{label}</p>
        <p className="mt-0.5 text-xl font-bold text-slate-900">{value}</p>
        {(sub || trend) && (
          <p className={`mt-0.5 flex items-center gap-1 text-[11px] font-medium ${trend ? (up ? "text-emerald-600" : "text-red-500") : "text-slate-400"}`}>
            {trend && (up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />)}
            {trend ?? sub}
          </p>
        )}
      </div>
    </div>
  );
}

/* ── Owner / Admin view ────────────────────────────────────────────────── */
function OwnerAdminDashboard({ name, isOwner }: { name: string; isOwner: boolean }) {
  const totalOrders = ORDERS_BY_STATUS.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Welcome back, {name}! <span className="text-2xl">🍽</span>
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">
          {isOwner
            ? "Here's what's happening across your meal service today."
            : "Here's a quick look at your meal service operations."}
        </p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        <StatCard icon={ShoppingBag}      label="Total Orders"     value="2,568"   iconBg="bg-indigo-500"  trend="+14% vs last week"  up />
        <StatCard icon={DollarSign}       label="Total Revenue"    value="$48,750" iconBg="bg-emerald-500" trend="+9% vs last month"   up />
        <StatCard icon={UtensilsCrossed}  label="Meals Served"     value="5,842"   iconBg="bg-violet-500"  trend="+11% this month"     up />
        <StatCard icon={Users}            label="Active Customers" value="1,248"   iconBg="bg-sky-500"     trend="+6% this month"      up />
        <StatCard icon={Clock}            label="Pending Orders"   value="156"     iconBg="bg-amber-500"   trend="-3% vs yesterday"    up />
      </div>

      {/* Row 2: Order trend + Donut */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Line chart */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Order Overview</h2>
              <p className="text-xs text-slate-400">Last 14 days vs prior period</p>
            </div>
            <span className="rounded-full bg-indigo-50 px-2.5 py-0.5 text-[11px] font-medium text-indigo-600">Live</span>
          </div>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={ORDER_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={2} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 4px 6px -1px rgb(0 0 0 / .05)" }} />
                <Line type="monotone" dataKey="orders" stroke="#6366f1" strokeWidth={2.5} dot={false} name="This period" />
                <Line type="monotone" dataKey="prev"   stroke="#e2e8f0" strokeWidth={2} dot={false} strokeDasharray="4 4" name="Prior period" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Donut */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold text-slate-900">Orders by Status</h2>
          <div className="relative mt-2 flex items-center justify-center">
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
                <p className="text-xl font-bold text-slate-900">{totalOrders.toLocaleString()}</p>
                <p className="text-[10px] text-slate-400">Total</p>
              </div>
            </div>
          </div>
          <div className="mt-3 flex flex-col gap-1.5">
            {ORDERS_BY_STATUS.map(d => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full shrink-0" style={{ background: d.color }} />
                  <span className="text-slate-600">{d.name}</span>
                </div>
                <span className="font-semibold text-slate-900">{d.value.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Row 3: Top meals + Revenue */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Top meals */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Top Selling Meals</h2>
            <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">View all →</button>
          </div>
          <div className="divide-y divide-slate-50">
            {TOP_MEALS.map((m, i) => (
              <div key={m.name} className="flex items-center gap-3 px-5 py-3 hover:bg-slate-50/60 transition-colors">
                <span className="w-4 shrink-0 text-xs font-bold text-slate-400">#{i + 1}</span>
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-lg ${m.color}`}>{m.emoji}</div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-slate-900">{m.name}</p>
                  <p className="text-[11px] text-slate-400">{m.orders.toLocaleString()} orders · {m.revenue}</p>
                </div>
                <span className={`shrink-0 text-[11px] font-semibold ${m.up ? "text-emerald-600" : "text-red-500"}`}>{m.trend}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Revenue chart */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-semibold text-slate-900">Revenue Overview</h2>
              <p className="text-xs text-slate-400">Jan – Jun 2026</p>
            </div>
            <div className="text-right">
              <p className="text-lg font-bold text-slate-900">$48,750</p>
              <p className="flex items-center justify-end gap-1 text-[11px] font-medium text-emerald-600">
                <TrendingUp className="h-3 w-3" />+7.8% this month
              </p>
            </div>
          </div>
          <div className="mt-4 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={REVENUE_TREND} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
                <defs>
                  <linearGradient id="rev" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="month" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false}
                  tickFormatter={v => `$${(v / 1000).toFixed(0)}k`} />
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }}
                  formatter={(v) => [`$${Number(v).toLocaleString()}`, "Revenue"]} />
                <Area type="monotone" dataKey="revenue" stroke="#6366f1" strokeWidth={2.5} fill="url(#rev)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Row 4: Recent orders + Inventory */}
      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Recent orders */}
        <div className="lg:col-span-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Recent Orders</h2>
            <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">View all →</button>
          </div>
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-50 bg-slate-50">
              <tr>
                <th className="px-5 py-3 font-semibold text-slate-500">Order ID</th>
                <th className="px-5 py-3 font-semibold text-slate-500">Customer</th>
                <th className="px-5 py-3 font-semibold text-slate-500">Date</th>
                <th className="px-5 py-3 font-semibold text-slate-500">Status</th>
                <th className="px-5 py-3 font-semibold text-slate-500 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {RECENT_ORDERS.map(o => (
                <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3 font-mono font-medium text-indigo-600">{o.id}</td>
                  <td className="px-5 py-3 text-slate-700">{o.customer}</td>
                  <td className="px-5 py-3 text-slate-400">{o.date}</td>
                  <td className="px-5 py-3">
                    <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${ORDER_STATUS_STYLES[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="px-5 py-3 text-right font-semibold text-slate-900">{o.total}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Inventory */}
        <div className="lg:col-span-2 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Inventory Alerts</h2>
            <AlertTriangle className="h-4 w-4 text-amber-400" />
          </div>
          <div className="divide-y divide-slate-50">
            {INVENTORY_ALERTS.map(a => (
              <div key={a.item} className="flex items-center justify-between px-5 py-3">
                <div>
                  <p className="text-xs font-medium text-slate-900">{a.item}</p>
                  <p className="text-[11px] text-slate-400">{a.level} {a.unit} remaining</p>
                </div>
                <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${
                  a.severity === "critical" ? "bg-red-50 text-red-700"
                  : a.severity === "warning" ? "bg-amber-50 text-amber-700"
                  : "bg-emerald-50 text-emerald-700"
                }`}>
                  {a.severity === "critical" ? "Critical" : a.severity === "warning" ? "Low" : "OK"}
                </span>
              </div>
            ))}
          </div>
          {isOwner && (
            <div className="border-t border-slate-100 px-5 py-3">
              <button type="button" className="w-full rounded-lg bg-indigo-600 py-2 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
                Reorder Supplies
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Admin-only: Active Kitchens */}
      {!isOwner && (
        <div className="grid grid-cols-1 gap-5 lg:grid-cols-2">
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Active Kitchens</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {ACTIVE_KITCHENS.map(k => {
                const pct = Math.round((k.orders / k.capacity) * 100);
                return (
                  <div key={k.name} className="px-5 py-3">
                    <div className="flex items-center justify-between">
                      <p className="text-xs font-medium text-slate-900">{k.name}</p>
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${k.status === "busy" ? "bg-amber-50 text-amber-700" : "bg-emerald-50 text-emerald-700"}`}>
                        {k.status}
                      </span>
                    </div>
                    <div className="mt-2 flex items-center gap-2">
                      <div className="flex-1 rounded-full bg-slate-100 h-1.5">
                        <div className={`h-1.5 rounded-full ${pct > 80 ? "bg-amber-500" : "bg-indigo-500"}`} style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-[11px] font-medium text-slate-500">{k.orders}/{k.capacity}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <div className="border-b border-slate-100 px-5 py-4">
              <h2 className="text-sm font-semibold text-slate-900">Pending Reviews</h2>
            </div>
            <div className="divide-y divide-slate-50">
              {PENDING_REVIEWS.map(r => (
                <div key={r.reviewer} className="flex items-start gap-3 px-5 py-3">
                  <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                    {r.reviewer.split(" ").map(n => n[0]).join("")}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-slate-900">{r.meal}</p>
                    <p className="text-[11px] text-slate-400">{r.reviewer} · {r.date}</p>
                  </div>
                  <div className="flex shrink-0 items-center gap-0.5">
                    {Array.from({ length: 5 }).map((_, i) => (
                      <Star key={i} className={`h-3 w-3 ${i < r.rating ? "fill-amber-400 text-amber-400" : "text-slate-200"}`} />
                    ))}
                  </div>
                </div>
              ))}
              <div className="px-5 py-3">
                <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">View all reviews →</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

/* ── Member view ───────────────────────────────────────────────────────── */
const DELIVERY_STEPS = ["Order Confirmed", "Preparing", "Out for Delivery", "Delivered"];

function MemberDashboard({ name }: { name: string }) {
  const MEAL_STATUS_STYLES: Record<string, string> = {
    delivered:         "bg-emerald-50 text-emerald-700",
    "out-for-delivery":"bg-sky-50 text-sky-700",
    preparing:         "bg-amber-50 text-amber-700",
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Welcome */}
      <div>
        <h1 className="text-xl font-bold text-slate-900">
          Welcome back, {name.split(" ")[0]}! <span className="text-2xl">🍽</span>
        </h1>
        <p className="mt-0.5 text-sm text-slate-500">Here&apos;s your meal tracker for today.</p>
      </div>

      {/* KPI row */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <StatCard icon={UtensilsCrossed} label="Meals Today"      value="3"     iconBg="bg-indigo-500"  sub="Tracked today"     />
        <StatCard icon={Flame}           label="Calories Consumed" value="1,850" iconBg="bg-orange-500" sub="of 2,400 kcal goal" />
        <StatCard icon={ShoppingBag}     label="Orders Placed"    value="12"    iconBg="bg-violet-500"  sub="This month"        />
        <StatCard icon={Bike}            label="Active Delivery"  value="1"     iconBg="bg-sky-500"     sub="Est. 12:30 PM"     />
      </div>

      <div className="grid grid-cols-1 gap-5 lg:grid-cols-5">
        {/* Today's meal schedule */}
        <div className="lg:col-span-3 rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Today&apos;s Meal Schedule</h2>
            <p className="mt-0.5 text-xs text-slate-400">Your planned meals for today</p>
          </div>
          <div className="divide-y divide-slate-50">
            {MY_MEAL_SCHEDULE.map(m => (
              <div key={m.slot} className="flex items-center gap-4 px-5 py-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-slate-50 text-2xl border border-slate-100">
                  {m.emoji}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-semibold uppercase tracking-wide text-slate-400">{m.slot}</span>
                    <span className="text-[10px] text-slate-300">·</span>
                    <span className="text-[10px] text-slate-400">{m.time}</span>
                  </div>
                  <p className="mt-0.5 truncate text-sm font-medium text-slate-900">{m.name}</p>
                  <p className="text-[11px] text-slate-400">{m.cal} kcal</p>
                </div>
                <span className={`shrink-0 rounded-full px-2.5 py-0.5 text-[10px] font-semibold capitalize ${MEAL_STATUS_STYLES[m.status]}`}>
                  {m.status.replace(/-/g, " ")}
                </span>
              </div>
            ))}
          </div>
          <div className="border-t border-slate-100 px-5 py-3">
            <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">
              View full meal plan →
            </button>
          </div>
        </div>

        {/* Nutrition + Delivery */}
        <div className="lg:col-span-2 flex flex-col gap-5">
          {/* Nutrition */}
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <h2 className="text-sm font-semibold text-slate-900">Nutrition Progress</h2>
            <p className="mt-0.5 text-xs text-slate-400">Today vs daily goal</p>
            <div className="mt-4 flex flex-col gap-4">
              {NUTRITION.map(n => {
                const Icon = n.icon;
                return (
                  <div key={n.label}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <Icon className="h-3.5 w-3.5 text-slate-500" />
                        <span className="text-xs font-medium text-slate-700">{n.label}</span>
                      </div>
                      <span className="text-xs font-semibold text-slate-900">
                        {n.current.toLocaleString()} / {n.target} {n.unit}
                      </span>
                    </div>
                    <div className="mt-1.5 h-2 w-full rounded-full bg-slate-100">
                      <div className={`h-2 rounded-full transition-all ${n.color}`} style={{ width: `${n.pct}%` }} />
                    </div>
                    <p className="mt-0.5 text-right text-[10px] text-slate-400">{n.pct}%</p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Active delivery */}
          <div className="rounded-xl border border-indigo-200 bg-gradient-to-br from-indigo-50 to-slate-50 p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">Active Delivery</h2>
              <Bike className="h-5 w-5 text-indigo-500" />
            </div>
            <p className="mt-1 text-xs text-slate-500">Grilled Chicken &amp; Green Tea · #ORD-1044</p>
            <p className="mt-0.5 text-xs font-semibold text-indigo-600">Est. arrival: 12:30 PM</p>
            <div className="mt-4">
              <div className="flex justify-between">
                {DELIVERY_STEPS.map((step, i) => (
                  <div key={step} className="flex flex-col items-center gap-1" style={{ width: `${100 / DELIVERY_STEPS.length}%` }}>
                    <div className={`flex h-6 w-6 items-center justify-center rounded-full text-[10px] font-bold ${
                      i < 3 ? "bg-indigo-600 text-white" : "bg-slate-200 text-slate-400"
                    }`}>
                      {i < 3 ? <CheckCircle className="h-3.5 w-3.5" /> : i + 1}
                    </div>
                    <p className={`text-center text-[9px] font-medium leading-tight ${i < 3 ? "text-indigo-700" : "text-slate-400"}`}>
                      {step}
                    </p>
                  </div>
                ))}
              </div>
              <div className="relative mt-1 h-1 rounded-full bg-slate-200">
                <div className="h-1 rounded-full bg-indigo-500 transition-all" style={{ width: "66%" }} />
              </div>
            </div>
            <p className="mt-3 flex items-center gap-1.5 text-[11px] text-slate-500">
              <MapPin className="h-3.5 w-3.5 text-indigo-400" />
              2.3 km away · Rider: Mark T.
            </p>
          </div>
        </div>
      </div>

      {/* Recommended meals */}
      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">Recommended Meals</h2>
          <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">View all →</button>
        </div>
        <div className="grid grid-cols-1 gap-4 p-5 sm:grid-cols-3">
          {RECOMMENDED_MEALS.map(m => (
            <div key={m.name} className={`rounded-xl bg-gradient-to-br ${m.color} p-4 border border-slate-100`}>
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-white text-3xl shadow-sm">{m.emoji}</div>
              <p className="mt-3 text-sm font-semibold text-slate-900">{m.name}</p>
              <p className="mt-0.5 text-xs text-slate-500">{m.cal} kcal · {m.price}</p>
              <div className="mt-1.5 flex items-center gap-1">
                <Star className="h-3 w-3 fill-amber-400 text-amber-400" />
                <span className="text-[11px] font-medium text-slate-700">{m.rating}</span>
              </div>
              <button type="button" className="mt-3 flex w-full items-center justify-center gap-1.5 rounded-lg bg-indigo-600 py-1.5 text-xs font-semibold text-white hover:bg-indigo-500 transition-colors">
                Order Now <ChevronRight className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Recent orders */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
          <h2 className="text-sm font-semibold text-slate-900">My Recent Orders</h2>
          <button type="button" className="text-xs font-medium text-indigo-600 hover:text-indigo-500">Order history →</button>
        </div>
        <table className="w-full text-left text-xs">
          <thead className="border-b border-slate-50 bg-slate-50">
            <tr>
              <th className="px-5 py-3 font-semibold text-slate-500">Order</th>
              <th className="px-5 py-3 font-semibold text-slate-500">Date</th>
              <th className="px-5 py-3 font-semibold text-slate-500">Status</th>
              <th className="px-5 py-3 font-semibold text-slate-500 text-right">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {MY_RECENT_ORDERS.map(o => (
              <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                <td className="px-5 py-3">
                  <p className="font-mono font-medium text-indigo-600">{o.id}</p>
                  <p className="mt-0.5 text-slate-500">{o.name}</p>
                </td>
                <td className="px-5 py-3 text-slate-400">{o.date}</td>
                <td className="px-5 py-3">
                  <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold capitalize ${ORDER_STATUS_STYLES[o.status]}`}>{o.status}</span>
                </td>
                <td className="px-5 py-3 text-right font-semibold text-slate-900">{o.total}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ── Page entry ────────────────────────────────────────────────────────── */
export default function MealServiceDashboardPage() {
  const { currentUser } = usePreviewUser();

  if (currentUser.role === "member") {
    return <MemberDashboard name={currentUser.name} />;
  }

  return (
    <OwnerAdminDashboard
      name={currentUser.name}
      isOwner={currentUser.role === "owner"}
    />
  );
}
