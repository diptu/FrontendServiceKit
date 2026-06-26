"use client";

import { useState } from "react";
import { Search, Plus, Download, Filter, Eye, Edit2 } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn, SlideUp } from "@/components/ui";
import { Button } from "@/components/ui";

const STATS = [
  { label: "Total Customers", value: "1,284", sub: "All time",        color: "bg-indigo-500"  },
  { label: "Active",          value: "1,102", sub: "85.8% of total",  color: "bg-emerald-500" },
  { label: "New This Month",  value: "86",    sub: "+6.3% MoM",       color: "bg-violet-500"  },
  { label: "At Risk",         value: "42",    sub: "3.3% churn risk", color: "bg-amber-500"   },
];

const CUSTOMERS = [
  { name: "Alice Wright",  email: "alice.w@nutracorp.test",   plan: "High Protein",  status: "active",   joined: "Jan 14, 2026", orders: 48, spent: "$2,160" },
  { name: "Bob Keller",    email: "bob.k@nutracorp.test",     plan: "Balanced Plan", status: "active",   joined: "Feb 3, 2026",  orders: 32, spent: "$1,280" },
  { name: "Charlie N.",    email: "charlie.n@nutracorp.test", plan: "Low Carb",      status: "active",   joined: "Mar 22, 2026", orders: 20, spent: "$980"   },
  { name: "Dana Osei",     email: "dana.o@nutracorp.test",    plan: "Vegetarian",    status: "inactive", joined: "Jan 8, 2026",  orders: 8,  spent: "$400"   },
  { name: "Evan Marsh",    email: "evan.m@nutracorp.test",    plan: "Balanced Plan", status: "active",   joined: "Apr 11, 2026", orders: 24, spent: "$960"   },
  { name: "Fatima Reyes",  email: "fatima.r@nutracorp.test",  plan: "High Protein",  status: "active",   joined: "May 5, 2026",  orders: 18, spent: "$810"   },
  { name: "George Lin",    email: "george.l@nutracorp.test",  plan: "Keto Plan",     status: "active",   joined: "Feb 28, 2026", orders: 30, spent: "$1,500" },
  { name: "Hana Popov",    email: "hana.p@nutracorp.test",    plan: "Mediterranean", status: "inactive", joined: "Mar 1, 2026",  orders: 5,  spent: "$260"   },
];

const STATUS_STYLE: Record<string, string> = {
  active:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  inactive: "bg-slate-100 text-slate-500 border-slate-200",
};

export default function CustomersPage() {
  const [search, setSearch] = useState("");

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Customers</h1>
          <p className="mt-0.5 text-sm text-slate-500">View and manage all subscribed customers across the organisation.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" icon={Download}>Export</Button>
          <Button size="sm" icon={Plus}>Add Customer</Button>
        </div>
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
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search customers..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
          </div>
          {["All Plans", "All Statuses"].map(l => (
            <select key={l} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none"><option>{l}</option></select>
          ))}
          <button type="button" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"><Filter className="h-3.5 w-3.5" />Filters</button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="border-b border-slate-50 bg-slate-50">
              <tr>
                {["Customer", "Plan", "Status", "Joined", "Orders", "Spent", ""].map(h => (
                  <th key={h} className="px-4 py-3 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {CUSTOMERS.filter(c => !search || c.name.toLowerCase().includes(search.toLowerCase())).map(c => (
                <tr key={c.email} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                        {c.name.split(" ").map(n => n[0]).join("")}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900">{c.name}</p>
                        <p className="text-slate-400">{c.email}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{c.plan}</td>
                  <td className="px-4 py-3">
                    <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[c.status]}`}>{c.status}</span>
                  </td>
                  <td className="px-4 py-3 text-slate-400 whitespace-nowrap">{c.joined}</td>
                  <td className="px-4 py-3 font-medium text-slate-900">{c.orders}</td>
                  <td className="px-4 py-3 font-semibold text-emerald-700">{c.spent}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100"><Eye className="h-3 w-3" /></button>
                      <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100"><Edit2 className="h-3 w-3" /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
          <span>Showing {CUSTOMERS.length} of 1,284 customers</span>
          <div className="flex items-center gap-1">
            {[1,2,3].map(p => <button key={p} type="button" className={`h-6 w-6 rounded text-[11px] ${p === 1 ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>)}
          </div>
        </div>
      </SlideUp>
    </div>
  );
}
