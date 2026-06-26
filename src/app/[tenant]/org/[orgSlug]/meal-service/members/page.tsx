"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Search, Download, Plus, Filter, CheckCircle2, XCircle, Clock, Eye } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn, SlideUp } from "@/components/ui";
import { Button } from "@/components/ui";

const STATS = [
  { label: "All Requests", value: "142", sub: "100% total",    color: "bg-slate-500"   },
  { label: "Pending",      value: "74",  sub: "52.1% of total",color: "bg-amber-500"   },
  { label: "Approved",     value: "52",  sub: "36.6% of total",color: "bg-emerald-500" },
  { label: "Rejected",     value: "16",  sub: "11.3% of total",color: "bg-red-500"     },
];

const REQUESTS = [
  { id: "#REQ-2056", member: "Alice Wright",  email: "alice.w@nutracorp.test",   status: "pending",  location: "Downtown",  plan: "High Protein",  date: "Jun 26, 2026", priority: "high",   amount: "$180/mo" },
  { id: "#REQ-2055", member: "Bob Keller",    email: "bob.k@nutracorp.test",     status: "approved", location: "Westside",  plan: "Balanced Plan", date: "Jun 26, 2026", priority: "medium", amount: "$120/mo" },
  { id: "#REQ-2054", member: "Charlie N.",    email: "charlie.n@nutracorp.test", status: "pending",  location: "Eastside",  plan: "Low Carb",      date: "Jun 25, 2026", priority: "low",    amount: "$150/mo" },
  { id: "#REQ-2053", member: "Dana Osei",     email: "dana.o@nutracorp.test",    status: "rejected", location: "Downtown",  plan: "Vegetarian",    date: "Jun 25, 2026", priority: "medium", amount: "$100/mo" },
  { id: "#REQ-2052", member: "Evan Marsh",    email: "evan.m@nutracorp.test",    status: "approved", location: "Northgate", plan: "Balanced Plan", date: "Jun 24, 2026", priority: "high",   amount: "$120/mo" },
  { id: "#REQ-2051", member: "Fatima Reyes",  email: "fatima.r@nutracorp.test",  status: "pending",  location: "Westside",  plan: "High Protein",  date: "Jun 24, 2026", priority: "high",   amount: "$180/mo" },
  { id: "#REQ-2050", member: "George Lin",    email: "george.l@nutracorp.test",  status: "approved", location: "Eastside",  plan: "Keto Plan",     date: "Jun 23, 2026", priority: "low",    amount: "$160/mo" },
  { id: "#REQ-2049", member: "Hana Popov",    email: "hana.p@nutracorp.test",    status: "pending",  location: "Downtown",  plan: "Mediterranean", date: "Jun 23, 2026", priority: "medium", amount: "$130/mo" },
];

const DONUT = [
  { name: "Pending",  value: 74, color: "#f59e0b" },
  { name: "Approved", value: 52, color: "#10b981" },
  { name: "Rejected", value: 16, color: "#ef4444" },
];

const RECENT_REQS = [
  { name: "Alice Wright", plan: "High Protein",  date: "Jun 26", status: "pending",  avatar: "AW", bg: "bg-indigo-500" },
  { name: "Bob Keller",   plan: "Balanced Plan", date: "Jun 26", status: "approved", avatar: "BK", bg: "bg-emerald-500"},
  { name: "Charlie N.",   plan: "Low Carb",      date: "Jun 25", status: "pending",  avatar: "CN", bg: "bg-violet-500" },
];

const STATUS_STYLE: Record<string, string> = {
  pending:  "bg-amber-50 text-amber-700 border-amber-200",
  approved: "bg-emerald-50 text-emerald-700 border-emerald-200",
  rejected: "bg-red-50 text-red-700 border-red-200",
};

const PRIORITY_STYLE: Record<string, string> = {
  high:   "bg-red-50 text-red-600 border-red-200",
  medium: "bg-amber-50 text-amber-600 border-amber-200",
  low:    "bg-slate-50 text-slate-600 border-slate-200",
};

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const total = DONUT.reduce((s, d) => s + d.value, 0);

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Meal Requests</h1>
          <p className="mt-0.5 text-sm text-slate-500">Review and manage all meal plan requests from members.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" icon={Download}>Export Requests</Button>
          <Button size="sm" icon={Plus}>New Request</Button>
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

      <SlideUp className="grid grid-cols-1 gap-5 xl:grid-cols-5">
        {/* Table */}
        <div className="xl:col-span-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search requests..." className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
            </div>
            {["All Teams", "All Locations", "All Statuses", "All Plan Types"].map(l => (
              <select key={l} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none"><option>{l}</option></select>
            ))}
            <button type="button" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Filter className="h-3.5 w-3.5" />Filters
            </button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-50 bg-slate-50">
                <tr>
                  {["#", "Member", "Status", "Location", "Meal Plan", "Date", "Priority", "Amount", ""].map(h => (
                    <th key={h} className="px-3 py-3 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {REQUESTS.filter(r => !search || r.member.toLowerCase().includes(search.toLowerCase())).map(r => (
                  <tr key={r.id} className="hover:bg-slate-50/60 transition-colors">
                    <td className="px-3 py-3 font-mono font-semibold text-indigo-600">{r.id}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-[10px] font-bold text-indigo-700">
                          {r.member.split(" ").map(n => n[0]).join("")}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{r.member}</p>
                          <p className="text-slate-400">{r.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                    </td>
                    <td className="px-3 py-3 text-slate-500">{r.location}</td>
                    <td className="px-3 py-3 text-slate-600">{r.plan}</td>
                    <td className="px-3 py-3 text-slate-400 whitespace-nowrap">{r.date}</td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${PRIORITY_STYLE[r.priority]}`}>{r.priority}</span>
                    </td>
                    <td className="px-3 py-3 font-semibold text-slate-900">{r.amount}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-emerald-500 hover:bg-emerald-50"><CheckCircle2 className="h-3.5 w-3.5" /></button>
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-50"><XCircle className="h-3.5 w-3.5" /></button>
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100"><Eye className="h-3 w-3" /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <span>Showing {REQUESTS.length} of 142 requests</span>
            <div className="flex items-center gap-1">
              {[1,2,3].map(p => <button key={p} type="button" className={`h-6 w-6 rounded text-[11px] ${p === 1 ? "bg-indigo-600 text-white" : "text-slate-600 hover:bg-slate-100"}`}>{p}</button>)}
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-2 flex flex-col gap-4">
          {/* Donut */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Request Overview</h3>
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
                  <div className="flex items-center gap-2"><span className="h-2 w-2 rounded-full" style={{ background: d.color }} /><span className="text-slate-600">{d.name}</span></div>
                  <span className="font-semibold text-slate-900">{d.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Recent */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Recent Requests</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {RECENT_REQS.map(r => (
                <div key={r.name} className="flex items-center gap-3 px-4 py-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${r.bg} text-[10px] font-bold text-white`}>{r.avatar}</div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-slate-900">{r.name}</p>
                    <p className="text-[11px] text-slate-400">{r.plan} · {r.date}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[r.status]}`}>{r.status}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Button fullWidth size="sm" icon={Clock}>Review Pending</Button>
              <Button fullWidth size="sm" variant="secondary" icon={CheckCircle2}>Bulk Approve</Button>
              <Button fullWidth size="sm" variant="secondary" icon={Download}>Export Report</Button>
            </div>
          </div>
        </div>
      </SlideUp>
    </div>
  );
}
