"use client";

import { useState } from "react";
import { AppWindow, ExternalLink, Search, X } from "lucide-react";
import { MemberCard, MemberStatCard, AppRow } from "@/components/member/ui";

const APPS = [
  { id:"a1", name:"NutriTrack",   description:"Financial Management platform for tracking revenue and expenses.",             category:"Finance",    accessLevel:"Full Access" as const, status:"Active" as const,   initials:"NT", color:"bg-indigo-500",   assignedOn:"Jan 12, 2026", lastAccessed:"Today 14:28" },
  { id:"a2", name:"NutriFlex",    description:"Nutrition planning and meal scheduling suite for team health.",                category:"Health",     accessLevel:"Full Access" as const, status:"Active" as const,   initials:"NF", color:"bg-emerald-500",  assignedOn:"Jan 12, 2026", lastAccessed:"Today 13:45" },
  { id:"a3", name:"NutriAdmin",   description:"Organisation admin portal — manage users, settings and policies.",            category:"Management", accessLevel:"Read Only"  as const, status:"Active" as const,   initials:"NA", color:"bg-amber-500",    assignedOn:"Feb 3, 2026",  lastAccessed:"Jun 24" },
  { id:"a4", name:"NutriCalc",    description:"Calorie and macro tracker with diet plan support.",                           category:"Health",     accessLevel:"Read Only"  as const, status:"Active" as const,   initials:"NC", color:"bg-blue-500",     assignedOn:"Feb 3, 2026",  lastAccessed:"Jun 23" },
  { id:"a5", name:"NutriReport",  description:"Analytics and data reporting for nutrition and business metrics.",            category:"Analytics",  accessLevel:"Full Access" as const, status:"Active" as const,   initials:"NR", color:"bg-violet-500",   assignedOn:"Mar 8, 2026",  lastAccessed:"Today 13:45" },
  { id:"a6", name:"NutriDoc",     description:"Document management and file sharing with e-signature support.",              category:"Docs",       accessLevel:"Limited"    as const, status:"Active" as const,   initials:"ND", color:"bg-pink-500",     assignedOn:"Apr 1, 2026",  lastAccessed:"Jun 20" },
  { id:"a7", name:"NutriAPI",     description:"Developer portal for API key management and documentation.",                  category:"Dev",        accessLevel:"Read Only"  as const, status:"Inactive" as const, initials:"NP", color:"bg-slate-400",    assignedOn:"Apr 15, 2026", lastAccessed:"Jun 10" },
  { id:"a8", name:"NutriAudit",   description:"Audit log and compliance reporting viewer for regulated environments.",        category:"Compliance", accessLevel:"No Access"  as const, status:"Inactive" as const, initials:"AU", color:"bg-red-400",     assignedOn:"May 1, 2026",  lastAccessed:"Never" },
];

const TABS = ["All", "Active", "Inactive"] as const;
type Tab = (typeof TABS)[number];

export default function MemberApplicationsPage() {
  const [tab,    setTab]    = useState<Tab>("All");
  const [search, setSearch] = useState("");
  const [reqOpen, setReqOpen] = useState(false);

  const filtered = APPS.filter((a) => {
    const matchTab = tab === "All" || (tab === "Active" && a.status === "Active") || (tab === "Inactive" && a.status === "Inactive");
    const matchQ   = a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchQ;
  });

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
        Preview mode — My Applications. Auth gate disabled for local dev.
      </div>

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">My Applications</h1>
          <p className="mt-0.5 text-sm text-slate-500">Applications you have been granted access to.</p>
        </div>
        <button
          type="button"
          onClick={() => setReqOpen(true)}
          className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700"
        >
          + Request Access
        </button>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MemberStatCard icon={AppWindow} value={8}  label="Total Apps"     sub="Across all categories"  />
        <MemberStatCard icon={AppWindow} value={6}  label="Active"         sub="Currently accessible"   iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <MemberStatCard icon={AppWindow} value={3}  label="Full Access"    sub="Unrestricted"           iconBg="bg-violet-50"  iconColor="text-violet-600" />
        <MemberStatCard icon={AppWindow} value={2}  label="Inactive"       sub="Access suspended"       iconBg="bg-red-50"     iconColor="text-red-600" />
      </div>

      {/* Filter bar + tabs */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-1 rounded-xl bg-slate-100 p-1">
          {TABS.map((t) => (
            <button key={t} type="button" onClick={() => setTab(t)}
              className={`rounded-lg px-4 py-1.5 text-xs font-semibold transition-colors ${tab === t ? "bg-white text-slate-900 shadow-sm" : "text-slate-500 hover:text-slate-700"}`}>
              {t}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
          <input
            value={search} onChange={(e) => setSearch(e.target.value)}
            placeholder="Search applications…"
            className="rounded-lg border border-slate-200 bg-white py-2 pl-8 pr-4 text-xs text-slate-800 outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 w-56"
          />
        </div>
      </div>

      {/* App list */}
      <MemberCard title={`${filtered.length} Application${filtered.length !== 1 ? "s" : ""}`}>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No applications match your search.</p>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Application", "Category", "Access Level", "Status", "Last Accessed", ""].map((h) => (
                    <th key={h} className="pb-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map((app) => (
                  <tr key={app.id} className="hover:bg-slate-50">
                    <td className="py-3 pr-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-xs font-bold text-white ${app.color}`}>{app.initials}</div>
                        <div>
                          <p className="font-semibold text-slate-900">{app.name}</p>
                          <p className="text-[11px] text-slate-400 truncate max-w-[200px]">{app.description}</p>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-500">{app.category}</td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${{
                        "Full Access":"bg-emerald-50 text-emerald-700",
                        "Read Only":"bg-blue-50 text-blue-700",
                        "Limited":"bg-amber-50 text-amber-700",
                        "No Access":"bg-red-50 text-red-700",
                      }[app.accessLevel]}`}>{app.accessLevel}</span>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${app.status === "Active" ? "bg-green-50 text-green-700" : "bg-slate-100 text-slate-500"}`}>{app.status}</span>
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-400">{app.lastAccessed}</td>
                    <td className="py-3">
                      <button type="button" disabled={app.status === "Inactive"}
                        className="flex items-center gap-1.5 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100 disabled:cursor-not-allowed disabled:opacity-40">
                        <ExternalLink className="h-3 w-3" /> Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </MemberCard>

      {/* Request Access modal stub */}
      {reqOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-base font-semibold text-slate-900">Request Application Access</h2>
              <button type="button" onClick={() => setReqOpen(false)} className="rounded-lg p-1 hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-500" />
              </button>
            </div>
            <div className="flex flex-col gap-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Application Name</label>
                <input placeholder="e.g. NutriPay" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200" />
              </div>
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Business Justification</label>
                <textarea rows={3} placeholder="Explain why you need access…" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200 resize-none" />
              </div>
            </div>
            <div className="mt-4 flex justify-end gap-2">
              <button type="button" onClick={() => setReqOpen(false)} className="rounded-lg border border-slate-200 px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50">Cancel</button>
              <button type="button" onClick={() => setReqOpen(false)} className="rounded-lg bg-indigo-600 px-4 py-2 text-xs font-semibold text-white hover:bg-indigo-700">Submit Request</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
