"use client";

import {
  AreaChart, Area, PieChart, Pie, Cell, Tooltip, ResponsiveContainer,
  XAxis, YAxis, CartesianGrid,
} from "recharts";
import { Download, Settings, RefreshCw, Target, TrendingUp } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn, SlideUp } from "@/components/ui";
import { Button } from "@/components/ui";

/* ── Mock data ───────────────────────────────────────────────────────────── */
const MACRO_STATS = [
  { label: "Avg Calorie/Day", value: "810", unit: "kcal", color: "bg-orange-500", light: "bg-orange-50", text: "text-orange-600", pct: 34 },
  { label: "Avg Protein",     value: "26.4", unit: "g",   color: "bg-indigo-500", light: "bg-indigo-50", text: "text-indigo-600", pct: 18 },
  { label: "Avg Fat",         value: "18.4", unit: "g",   color: "bg-rose-500",   light: "bg-rose-50",   text: "text-rose-600",   pct: 11 },
  { label: "Avg Carbs",       value: "64.2", unit: "g",   color: "bg-amber-500",  light: "bg-amber-50",  text: "text-amber-600",  pct: 44 },
  { label: "Avg Fiber",       value: "6.8",  unit: "g",   color: "bg-lime-500",   light: "bg-lime-50",   text: "text-lime-600",   pct: 27 },
];

const MACRO_BREAKDOWN = [
  { label: "Calories",       value: "642",  unit: "avg/day",   sub: "34% of daily goal",   color: "#f97316", pct: 34 },
  { label: "Protein",        value: "26.4", unit: "g",          sub: "18% of total intake", color: "#6366f1", pct: 18 },
  { label: "Total Fat",      value: "18.4", unit: "g",          sub: "11% of calories",     color: "#f43f5e", pct: 11 },
  { label: "Carbohydrates",  value: "64.2", unit: "g",          sub: "44% of calories",     color: "#f59e0b", pct: 44 },
  { label: "Fiber",          value: "6.8",  unit: "g",          sub: "8% of daily value",   color: "#84cc16", pct: 8  },
  { label: "Sodium",         value: "842",  unit: "mg",         sub: "36% of daily value",  color: "#8b5cf6", pct: 36 },
];

const TREND_DATA = Array.from({ length: 14 }, (_, i) => ({
  day: `Jun ${i + 13}`,
  calories: 780 + Math.round(Math.sin(i * 0.8) * 80),
  protein:  25 + Math.round(Math.sin(i * 0.5) * 6),
  carbs:    60 + Math.round(Math.sin(i * 0.6) * 10),
}));

const TOP_MEALS = [
  { name: "Grilled Chicken Salad", emoji: "🥗", calories: 420, protein: 38, carbs: 22, fat: 14, fiber: 6, rating: 4.8 },
  { name: "Salmon Power Plate",    emoji: "🍣", calories: 580, protein: 45, carbs: 18, fat: 28, fiber: 3, rating: 4.9 },
  { name: "Quinoa Veggie Bowl",    emoji: "🍚", calories: 390, protein: 18, carbs: 58, fat: 10, fiber: 9, rating: 4.7 },
  { name: "Protein Boost Meal",    emoji: "💪", calories: 520, protein: 52, carbs: 32, fat: 16, fiber: 4, rating: 4.6 },
  { name: "Mediterranean Bowl",    emoji: "🥙", calories: 490, protein: 28, carbs: 48, fat: 20, fiber: 7, rating: 4.8 },
];

const DIST = [
  { name: "Calories", value: 34, color: "#f97316" },
  { name: "Protein",  value: 18, color: "#6366f1" },
  { name: "Fat",      value: 11, color: "#f43f5e" },
  { name: "Carbs",    value: 44, color: "#f59e0b" },
  { name: "Fiber",    value: 8,  color: "#84cc16" },
];

export default function NutritionPage() {
  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Nutrition Overview</h1>
          <p className="mt-0.5 text-sm text-slate-500">Track nutritional information and make healthier menu decisions.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600">May 27 – Jun 26, 2026</span>
          <Button variant="secondary" size="sm" icon={Download}>Export Report</Button>
        </div>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-5">
        {MACRO_STATS.map(m => (
          <StaggerItem key={m.label}>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`inline-flex h-9 w-9 items-center justify-center rounded-lg ${m.light} mb-3`}>
                <span className={`text-sm font-bold ${m.text}`}>{m.unit}</span>
              </div>
              <p className="text-xs font-medium text-slate-500">{m.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{m.value} <span className="text-sm font-normal text-slate-400">{m.unit}</span></p>
              <div className="mt-2 h-1.5 w-full rounded-full bg-slate-100">
                <div className={`h-1.5 rounded-full ${m.color}`} style={{ width: `${m.pct}%` }} />
              </div>
              <p className="mt-1 text-[10px] text-slate-400">{m.pct}% of daily target</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      {/* Macro breakdown grid */}
      <SlideUp>
        <h2 className="mb-3 text-sm font-semibold text-slate-900">Nutrition Breakdown</h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-6">
          {MACRO_BREAKDOWN.map(m => (
            <div key={m.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm text-center">
              <div className="relative mx-auto h-16 w-16">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={[{ value: m.pct }, { value: 100 - m.pct }]} cx="50%" cy="50%" innerRadius={22} outerRadius={32} dataKey="value" startAngle={90} endAngle={-270}>
                      <Cell fill={m.color} />
                      <Cell fill="#f1f5f9" />
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-[10px] font-bold text-slate-900">{m.pct}%</span>
                </div>
              </div>
              <p className="mt-2 text-xs font-semibold text-slate-900">{m.label}</p>
              <p className="text-base font-bold" style={{ color: m.color }}>{m.value}<span className="text-xs font-normal text-slate-400"> {m.unit}</span></p>
              <p className="mt-0.5 text-[10px] text-slate-400">{m.sub}</p>
            </div>
          ))}
        </div>
      </SlideUp>

      <SlideUp delay={0.06} className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Table */}
        <div className="xl:col-span-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-100 px-5 py-4">
            <h2 className="text-sm font-semibold text-slate-900">Top Meals by Nutrition</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-50 bg-slate-50">
                <tr>
                  {["Meal", "Calories", "Protein", "Carbs", "Fat", "Fiber", "Rating"].map(h => (
                    <th key={h} className="px-4 py-3 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {TOP_MEALS.map(m => (
                  <tr key={m.name} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <span className="text-base">{m.emoji}</span>
                        <span className="font-medium text-slate-900">{m.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-medium text-orange-600">{m.calories} kcal</td>
                    <td className="px-4 py-3 text-indigo-600">{m.protein}g</td>
                    <td className="px-4 py-3 text-amber-600">{m.carbs}g</td>
                    <td className="px-4 py-3 text-rose-600">{m.fat}g</td>
                    <td className="px-4 py-3 text-lime-600">{m.fiber}g</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <span className="text-amber-400">★</span>
                        <span className="font-semibold text-slate-900">{m.rating}</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-2 text-sm font-semibold text-slate-900">Measurement Distribution</h3>
            <div className="flex justify-center">
              <div className="h-36 w-36 relative">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie data={DIST} cx="50%" cy="50%" innerRadius={40} outerRadius={60} dataKey="value" paddingAngle={3}>
                      {DIST.map((d, i) => <Cell key={i} fill={d.color} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
            <div className="mt-3 flex flex-col gap-1.5">
              {DIST.map(d => (
                <div key={d.name} className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: d.color }} /><span className="text-slate-600">{d.name}</span></div>
                  <span className="font-semibold text-slate-900">{d.value}%</span>
                </div>
              ))}
            </div>
          </div>

          {/* Trend chart */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Nutrition Trends</h3>
            <div className="h-40">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={TREND_DATA} margin={{ top: 4, right: 4, bottom: 0, left: -28 }}>
                  <defs>
                    <linearGradient id="gcal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#f97316" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#f97316" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="day" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} interval={3} />
                  <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                  <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8, border: "1px solid #e2e8f0" }} />
                  <Area type="monotone" dataKey="calories" stroke="#f97316" strokeWidth={2} fill="url(#gcal)" name="Calories" />
                  <Area type="monotone" dataKey="protein"  stroke="#6366f1" strokeWidth={1.5} fill="none" name="Protein (g)" />
                  <Area type="monotone" dataKey="carbs"    stroke="#f59e0b" strokeWidth={1.5} fill="none" name="Carbs (g)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Button fullWidth size="sm" variant="secondary" icon={Download}>Export Report</Button>
              <Button fullWidth size="sm" variant="secondary" icon={Target}>Set Nutrition Goals</Button>
              <Button fullWidth size="sm" variant="secondary" icon={Settings}>Filter Settings</Button>
              <Button fullWidth size="sm" variant="secondary" icon={RefreshCw}>Refresh Data</Button>
            </div>
          </div>
        </div>
      </SlideUp>
    </div>
  );
}
