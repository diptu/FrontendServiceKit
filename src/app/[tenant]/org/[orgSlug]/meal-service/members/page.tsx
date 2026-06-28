"use client";

import { useState } from "react";
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Search, Download, Plus, Filter, UserCheck, UserX, Eye } from "lucide-react";
import { StaggerContainer, StaggerItem, FadeIn, SlideUp } from "@/components/ui";
import { Button } from "@/components/ui";

/* ── Data ────────────────────────────────────────────────────────────────── */

type MemberRole   = "owner" | "admin" | "moderator" | "member";
type MemberStatus = "active" | "pending" | "inactive";

interface Member {
  id:     string;
  name:   string;
  email:  string;
  role:   MemberRole;
  status: MemberStatus;
  plan:   string;
  joined: string;
  avatar: string;
  bg:     string;
}

const MEMBERS: Member[] = [
  // Owner (1)
  { id: "#MEM-001", name: "Sarah Johnson",  email: "sarah.j@nutracorp.test",   role: "owner",     status: "active",   plan: "Athlete Pro",     joined: "Jan 10, 2026", avatar: "SJ", bg: "bg-violet-600"  },
  // Admin (1)
  { id: "#MEM-002", name: "Michael Torres", email: "michael.t@nutracorp.test", role: "admin",     status: "active",   plan: "High Protein",    joined: "Feb 03, 2026", avatar: "MT", bg: "bg-indigo-600"  },
  // Moderator (1)
  { id: "#MEM-003", name: "Priya Sharma",   email: "priya.s@nutracorp.test",   role: "moderator", status: "active",   plan: "Vegetarian Plan", joined: "Feb 20, 2026", avatar: "PS", bg: "bg-teal-600"    },
  // Members (5)
  { id: "#MEM-004", name: "Alice Wright",   email: "alice.w@nutracorp.test",   role: "member",    status: "active",   plan: "Balanced Plan",   joined: "Mar 05, 2026", avatar: "AW", bg: "bg-emerald-500" },
  { id: "#MEM-005", name: "Bob Keller",     email: "bob.k@nutracorp.test",     role: "member",    status: "active",   plan: "Keto Flex",       joined: "Mar 12, 2026", avatar: "BK", bg: "bg-orange-500"  },
  { id: "#MEM-006", name: "Charlie Nash",   email: "charlie.n@nutracorp.test", role: "member",    status: "pending",  plan: "Low Carb",        joined: "Apr 01, 2026", avatar: "CN", bg: "bg-sky-500"     },
  { id: "#MEM-007", name: "Dana Osei",      email: "dana.o@nutracorp.test",    role: "member",    status: "active",   plan: "Med. Plan",       joined: "Apr 18, 2026", avatar: "DO", bg: "bg-pink-500"    },
  { id: "#MEM-008", name: "Evan Marsh",     email: "evan.m@nutracorp.test",    role: "member",    status: "inactive", plan: "Balanced Plan",   joined: "May 07, 2026", avatar: "EM", bg: "bg-amber-500"   },
];

const STATS = [
  { label: "Total Members", value: "8", sub: "1 owner · 1 admin · 1 mod · 5 members", color: "bg-slate-500"   },
  { label: "Active",        value: "6", sub: "75% of members",                         color: "bg-emerald-500" },
  { label: "Pending",       value: "1", sub: "Awaiting approval",                      color: "bg-amber-500"   },
  { label: "Inactive",      value: "1", sub: "Access suspended",                       color: "bg-red-500"     },
];

const DONUT = [
  { name: "Owner",     value: 1, color: "#7c3aed" },
  { name: "Admin",     value: 1, color: "#4f46e5" },
  { name: "Moderator", value: 1, color: "#0d9488" },
  { name: "Members",   value: 5, color: "#10b981" },
];

const RECENT = MEMBERS.slice(-3).reverse();

/* ── Style maps ──────────────────────────────────────────────────────────── */

const ROLE_STYLE: Record<MemberRole, string> = {
  owner:     "bg-violet-50 text-violet-700 border-violet-200",
  admin:     "bg-indigo-50 text-indigo-700 border-indigo-200",
  moderator: "bg-teal-50 text-teal-700 border-teal-200",
  member:    "bg-slate-100 text-slate-600 border-slate-200",
};

const STATUS_STYLE: Record<MemberStatus, string> = {
  active:   "bg-emerald-50 text-emerald-700 border-emerald-200",
  pending:  "bg-amber-50 text-amber-700 border-amber-200",
  inactive: "bg-red-50 text-red-700 border-red-200",
};

/* ── Page ────────────────────────────────────────────────────────────────── */

export default function MembersPage() {
  const [search, setSearch] = useState("");
  const total = DONUT.reduce((s, d) => s + d.value, 0);

  const filtered = MEMBERS.filter(m =>
    !search ||
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.email.toLowerCase().includes(search.toLowerCase()) ||
    m.role.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="flex flex-col gap-6">
      <FadeIn className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Members</h1>
          <p className="mt-0.5 text-sm text-slate-500">Manage organisation members and their meal plan assignments.</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <Button variant="secondary" size="sm" icon={Download}>Export</Button>
          <Button size="sm" icon={Plus}>Add Member</Button>
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

        {/* Member table */}
        <div className="xl:col-span-3 overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="flex flex-wrap items-center gap-2 border-b border-slate-100 px-4 py-3">
            <div className="relative flex-1 min-w-[160px]">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search members…"
                className="w-full rounded-lg border border-slate-200 bg-slate-50 py-1.5 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
            {["All Roles", "All Plans", "All Statuses"].map(l => (
              <select key={l} className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs text-slate-600 focus:outline-none">
                <option>{l}</option>
              </select>
            ))}
            <button type="button" className="flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
              <Filter className="h-3.5 w-3.5" /> Filters
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-slate-50 bg-slate-50">
                <tr>
                  {["#", "Member", "Role", "Status", "Meal Plan", "Joined", ""].map(h => (
                    <th key={h} className="px-3 py-3 font-semibold text-slate-500 whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {filtered.map(m => (
                  <tr key={m.id} className="transition-colors hover:bg-slate-50/60">
                    <td className="px-3 py-3 font-mono font-semibold text-indigo-600">{m.id}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <div className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${m.bg} text-[10px] font-bold text-white`}>
                          {m.avatar}
                        </div>
                        <div>
                          <p className="font-medium text-slate-900">{m.name}</p>
                          <p className="text-slate-400">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${ROLE_STYLE[m.role]}`}>
                        {m.role}
                      </span>
                    </td>
                    <td className="px-3 py-3">
                      <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${STATUS_STYLE[m.status]}`}>
                        {m.status}
                      </span>
                    </td>
                    <td className="px-3 py-3 text-slate-600">{m.plan}</td>
                    <td className="px-3 py-3 text-slate-400 whitespace-nowrap">{m.joined}</td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-1">
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-emerald-500 hover:bg-emerald-50">
                          <UserCheck className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-red-400 hover:bg-red-50">
                          <UserX className="h-3.5 w-3.5" />
                        </button>
                        <button type="button" className="flex h-6 w-6 items-center justify-center rounded text-slate-400 hover:bg-slate-100">
                          <Eye className="h-3 w-3" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="flex items-center justify-between border-t border-slate-100 px-4 py-3 text-xs text-slate-500">
            <span>Showing {filtered.length} of {MEMBERS.length} members</span>
            <div className="flex items-center gap-1">
              <button type="button" className="h-6 w-6 rounded bg-indigo-600 text-[11px] text-white">1</button>
            </div>
          </div>
        </div>

        {/* Sidebar */}
        <div className="xl:col-span-2 flex flex-col gap-4">

          {/* Role breakdown donut */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-900">Role Breakdown</h3>
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

          {/* Recently joined */}
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="border-b border-slate-100 px-4 py-3">
              <h3 className="text-sm font-semibold text-slate-900">Recently Joined</h3>
            </div>
            <div className="divide-y divide-slate-50">
              {RECENT.map(m => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${m.bg} text-[10px] font-bold text-white`}>
                    {m.avatar}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="truncate text-xs font-medium text-slate-900">{m.name}</p>
                    <p className="text-[11px] text-slate-400">{m.plan} · {m.joined}</p>
                  </div>
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-[10px] font-semibold capitalize ${ROLE_STYLE[m.role]}`}>
                    {m.role}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Quick actions */}
          <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
            <h3 className="mb-3 text-sm font-semibold text-slate-900">Quick Actions</h3>
            <div className="flex flex-col gap-2">
              <Button fullWidth size="sm" icon={Plus}>Invite Member</Button>
              <Button fullWidth size="sm" variant="secondary" icon={UserCheck}>Activate Pending</Button>
              <Button fullWidth size="sm" variant="secondary" icon={Download}>Export List</Button>
            </div>
          </div>
        </div>

      </SlideUp>
    </div>
  );
}
