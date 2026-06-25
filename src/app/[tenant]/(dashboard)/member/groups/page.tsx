"use client";

import { useState } from "react";
import { Search, UsersRound, X } from "lucide-react";
import { MemberCard, MemberStatCard } from "@/components/member/ui";

const GROUPS = [
  { id:"g1", name:"Apple Corp Engineering",    type:"Tenant"  as const, members:12, role:"Member",  joined:"Jan 12, 2026", description:"Core engineering team across web and infrastructure.",    permissions:["documents:READ","users:READ"] },
  { id:"g2", name:"Apple Corp Finance",        type:"Tenant"  as const, members:6,  role:"Member",  joined:"Jan 12, 2026", description:"Finance and accounting operations group.",                permissions:["documents:READ","documents:WRITE"] },
  { id:"g3", name:"Apple Corp Operations",     type:"Tenant"  as const, members:8,  role:"Member",  joined:"Feb 3, 2026",  description:"Operational processes and facilities management.",        permissions:["documents:READ"] },
  { id:"g4", name:"IAM Administrators",        type:"IAM"     as const, members:3,  role:"Viewer",  joined:"Mar 1, 2026",  description:"Read-only membership to IAM policy and audit views.",     permissions:["audit_logs:READ","policies:READ"] },
  { id:"g5", name:"Platform Beta Testers",     type:"System"  as const, members:15, role:"Member",  joined:"Apr 10, 2026", description:"Early access group for new platform features.",           permissions:["documents:READ","users:READ"] },
];

type Selected = (typeof GROUPS)[number] | null;

export default function MemberGroupsPage() {
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<Selected>(null);

  const filtered = GROUPS.filter((g) =>
    g.name.toLowerCase().includes(search.toLowerCase())
  );

  const TYPE_COLOR: Record<string, string> = {
    Tenant: "bg-indigo-50 text-indigo-700",
    System: "bg-slate-100 text-slate-700",
    IAM:    "bg-violet-50 text-violet-700",
  };

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
        Preview mode — My Groups. Auth gate disabled for local dev.
      </div>

      {/* Header */}
      <div>
        <h1 className="text-xl font-bold tracking-tight text-slate-900">My Groups</h1>
        <p className="mt-0.5 text-sm text-slate-500">Groups you belong to within this organisation.</p>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MemberStatCard icon={UsersRound} value={5}  label="Total Groups"   sub="Active memberships"   />
        <MemberStatCard icon={UsersRound} value={3}  label="Tenant Groups"  sub="Organisation groups"   iconBg="bg-violet-50"  iconColor="text-violet-600" />
        <MemberStatCard icon={UsersRound} value={1}  label="System Groups"  sub="Platform-wide"         iconBg="bg-slate-100"  iconColor="text-slate-600" />
        <MemberStatCard icon={UsersRound} value={44} label="Peers"          sub="Total members across"  iconBg="bg-emerald-50" iconColor="text-emerald-600" />
      </div>

      <div className="flex gap-4 items-start">
        {/* Table */}
        <div className="flex-1 min-w-0">
          <MemberCard title={`${filtered.length} Group${filtered.length !== 1 ? "s" : ""}`}
            footer={
              <div className="relative w-56">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                <input value={search} onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search groups…"
                  className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-4 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200" />
              </div>
            }
          >
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Group Name", "Type", "Members", "Your Role", "Joined", ""].map((h) => (
                    <th key={h} className="pb-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((g) => (
                  <tr key={g.id} onClick={() => setSelected((p) => p?.id === g.id ? null : g)}
                    className={`cursor-pointer hover:bg-slate-50 ${selected?.id === g.id ? "bg-indigo-50/50" : ""}`}>
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-600">
                          {g.name.charAt(0)}
                        </div>
                        <div>
                          <p className="font-semibold text-slate-900">{g.name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{g.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_COLOR[g.type]}`}>{g.type}</span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-600">{g.members}</td>
                    <td className="py-3 pr-4">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-600">{g.role}</span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-400">{g.joined}</td>
                    <td className="py-3 text-xs font-medium text-indigo-600 hover:underline cursor-pointer">Details</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </MemberCard>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-72 shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
              <div className="flex items-center gap-2">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-indigo-100 text-xs font-bold text-indigo-600">{selected.name.charAt(0)}</div>
                <span className="text-sm font-semibold text-slate-900">{selected.name}</span>
              </div>
              <button type="button" onClick={() => setSelected(null)} className="rounded p-1 hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              <p className="text-[11px] text-slate-500">{selected.description}</p>
              {[
                ["Type",    selected.type],
                ["Members", String(selected.members)],
                ["Your Role", selected.role],
                ["Joined",  selected.joined],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-[11px] text-slate-400">{l}</span>
                  <span className="text-[11px] font-semibold text-slate-700">{v}</span>
                </div>
              ))}
              <div className="border-t border-slate-100 pt-3">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Group Permissions</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.permissions.map((p) => (
                    <span key={p} className="rounded-md bg-indigo-50 px-2 py-0.5 text-[10px] font-mono font-semibold text-indigo-700">{p}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
