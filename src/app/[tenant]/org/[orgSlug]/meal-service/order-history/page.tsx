"use client";

import { useState } from "react";
import { Search, Download, Filter, Eye, RotateCcw } from "lucide-react";
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from "@/components/ui";
import { Button } from "@/components/ui";

const STATS = [
  { label: "Total Orders",   value: "124", sub: "All time",         color: "bg-indigo-500"  },
  { label: "This Month",     value: "18",  sub: "Jun 2026",         color: "bg-violet-500"  },
  { label: "Total Spent",    value: "$580",sub: "Lifetime value",   color: "bg-emerald-500" },
  { label: "Avg per Order",  value: "$4.7",sub: "Per delivery",     color: "bg-amber-500"   },
];

const ORDERS = [
  { id: "#ORD-3325", meal: "Grilled Chicken & Quinoa Salad", date: "Jun 26, 2026", slot: "Lunch",   status: "out for delivery", amount: "$14.50" },
  { id: "#ORD-3321", meal: "Grilled Chicken & Quinoa Salad", date: "Jun 25, 2026", slot: "Lunch",   status: "delivered",        amount: "$14.50" },
  { id: "#ORD-3318", meal: "Overnight Oats & Mixed Berries", date: "Jun 25, 2026", slot: "Breakfast",status: "delivered",       amount: "$8.90"  },
  { id: "#ORD-3309", meal: "Salmon with Steamed Vegetables", date: "Jun 24, 2026", slot: "Dinner",  status: "delivered",        amount: "$18.00" },
  { id: "#ORD-3302", meal: "Vegetarian Buddha Bowl",         date: "Jun 24, 2026", slot: "Lunch",   status: "delivered",        amount: "$12.00" },
  { id: "#ORD-3295", meal: "Avocado Quinoa Toast",           date: "Jun 23, 2026", slot: "Breakfast",status: "delivered",       amount: "$9.50"  },
  { id: "#ORD-3288", meal: "High Protein Bowl",              date: "Jun 23, 2026", slot: "Dinner",  status: "delivered",        amount: "$16.00" },
  { id: "#ORD-3280", meal: "Lentil Soup",                    date: "Jun 22, 2026", slot: "Lunch",   status: "delivered",        amount: "$10.50" },
];

const STATUS_STYLE: Record<string, string> = {
  delivered:          "bg-emerald-50 text-emerald-700 border-emerald-200",
  "out for delivery": "bg-sky-50 text-sky-700 border-sky-200",
  preparing:          "bg-amber-50 text-amber-700 border-amber-200",
};

export default function OrderHistoryPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Order History</h1>
          <p className="mt-0.5 text-sm text-slate-500">View all your past and active meal orders in one place.</p>
        </div>
        <Button variant="secondary" size="sm" icon={Download}>Export</Button>
      </FadeIn>

      <StaggerContainer className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {STATS.map(s => (
          <StaggerItem key={s.label}>
            <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
              <div className={`mb-2 h-1.5 w-10 rounded-full ${s.color}`} />
              <p className="text-xs font-medium text-slate-500">{s.label}</p>
              <p className="mt-1 text-2xl font-bold text-slate-900">{s.value}</p>
              <p className="mt-0.5 text-[10px] text-slate-400">{s.sub}</p>
            </div>
          </StaggerItem>
        ))}
      </StaggerContainer>

      <SlideUp className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
          <div className="relative flex-1 min-w-[160px]">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search orders..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          {["All Status", "All Slots"].map(l => (
            <select key={l} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none"><option>{l}</option></select>
          ))}
          <button type="button" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"><Filter className="h-3.5 w-3.5" />Filter</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-50 bg-slate-50">
              <tr>
                {["Order #", "Meal", "Date", "Slot", "Status", "Amount", ""].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {ORDERS.filter(o => !search || o.meal.toLowerCase().includes(search.toLowerCase())).map(o => (
                <tr key={o.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3 font-mono font-semibold text-indigo-600">{o.id}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{o.meal}</td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{o.date}</td>
                  <td className="px-4 py-3 text-slate-500">{o.slot}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[o.status]}`}>{o.status}</span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-900">{o.amount}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100"><Eye className="h-3 w-3" /></button>
                      <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100" title="Reorder"><RotateCcw className="h-3 w-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span>Showing {ORDERS.length} of 124 orders</span>
          <div className="flex items-center gap-1">
            {[1,2,3].map(p => <button key={p} type="button" className={`h-6 w-6 rounded text-[11px] ${p === 1 ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>)}
          </div>
        </div>
      </SlideUp>
    </div>
  );
}
