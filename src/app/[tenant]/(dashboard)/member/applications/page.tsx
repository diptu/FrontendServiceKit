"use client";

import { useState } from "react";
import { AppWindow, ExternalLink } from "lucide-react";
import { MemberCard, MemberStatCard } from "@/components/member/ui";
import { Banner, Button, Badge, StatusBadge, SearchBox, Tabs, Modal } from "@/components/ui";

const APPS = [
  { id:"a1", name:"NutriTrack",  description:"Financial Management platform for tracking revenue and expenses.",           category:"Finance",    accessLevel:"Full Access" as const, status:"Active" as const,   initials:"NT", color:"bg-indigo-500",   assignedOn:"Jan 12, 2026", lastAccessed:"Today 14:28" },
  { id:"a2", name:"NutriFlex",   description:"Nutrition planning and meal scheduling suite for team health.",              category:"Health",     accessLevel:"Full Access" as const, status:"Active" as const,   initials:"NF", color:"bg-emerald-500",  assignedOn:"Jan 12, 2026", lastAccessed:"Today 13:45" },
  { id:"a3", name:"NutriAdmin",  description:"Organisation admin portal — manage users, settings and policies.",          category:"Management", accessLevel:"Read Only"  as const, status:"Active" as const,   initials:"NA", color:"bg-amber-500",    assignedOn:"Feb 3, 2026",  lastAccessed:"Jun 24" },
  { id:"a4", name:"NutriCalc",   description:"Calorie and macro tracker with diet plan support.",                         category:"Health",     accessLevel:"Read Only"  as const, status:"Active" as const,   initials:"NC", color:"bg-blue-500",     assignedOn:"Feb 3, 2026",  lastAccessed:"Jun 23" },
  { id:"a5", name:"NutriReport", description:"Analytics and data reporting for nutrition and business metrics.",          category:"Analytics",  accessLevel:"Full Access" as const, status:"Active" as const,   initials:"NR", color:"bg-violet-500",   assignedOn:"Mar 8, 2026",  lastAccessed:"Today 13:45" },
  { id:"a6", name:"NutriDoc",    description:"Document management and file sharing with e-signature support.",            category:"Docs",       accessLevel:"Limited"    as const, status:"Active" as const,   initials:"ND", color:"bg-pink-500",     assignedOn:"Apr 1, 2026",  lastAccessed:"Jun 20" },
  { id:"a7", name:"NutriAPI",    description:"Developer portal for API key management and documentation.",                category:"Dev",        accessLevel:"Read Only"  as const, status:"Inactive" as const, initials:"NP", color:"bg-slate-400",    assignedOn:"Apr 15, 2026", lastAccessed:"Jun 10" },
  { id:"a8", name:"NutriAudit",  description:"Audit log and compliance reporting viewer for regulated environments.",     category:"Compliance", accessLevel:"No Access"  as const, status:"Inactive" as const, initials:"AU", color:"bg-red-400",      assignedOn:"May 1, 2026",  lastAccessed:"Never" },
];

const ACCESS_VARIANT: Record<string, "success"|"info"|"warning"|"error"> = {
  "Full Access": "success",
  "Read Only":   "info",
  "Limited":     "warning",
  "No Access":   "error",
};

const TABS = ["All", "Active", "Inactive"] as const;
type Tab = (typeof TABS)[number];

export default function MemberApplicationsPage() {
  const [tab,     setTab]    = useState<Tab>("All");
  const [search,  setSearch] = useState("");
  const [reqOpen, setReqOpen] = useState(false);

  const filtered = APPS.filter(a => {
    const matchTab = tab === "All" || (tab === "Active" && a.status === "Active") || (tab === "Inactive" && a.status === "Inactive");
    const matchQ   = a.name.toLowerCase().includes(search.toLowerCase()) || a.description.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchQ;
  });

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — My Applications. Auth gate disabled for local dev.
      </Banner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">My Applications</h1>
          <p className="mt-0.5 text-sm text-slate-500">Applications you have been granted access to.</p>
        </div>
        <Button icon={AppWindow} onClick={() => setReqOpen(true)}>Request Access</Button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MemberStatCard icon={AppWindow} value={8} label="Total Apps"  sub="Across all categories" />
        <MemberStatCard icon={AppWindow} value={6} label="Active"      sub="Currently accessible"  iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <MemberStatCard icon={AppWindow} value={3} label="Full Access" sub="Unrestricted"          iconBg="bg-violet-50"  iconColor="text-violet-600" />
        <MemberStatCard icon={AppWindow} value={2} label="Inactive"    sub="Access suspended"      iconBg="bg-red-50"     iconColor="text-red-600" />
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Tabs
          tabs={TABS.map(t => ({ key: t, label: t }))}
          activeKey={tab}
          onChange={v => setTab(v as Tab)}
          variant="pills"
        />
        <SearchBox value={search} onChange={setSearch} placeholder="Search applications…" size="sm" className="w-56" />
      </div>

      <MemberCard title={`${filtered.length} Application${filtered.length !== 1 ? "s" : ""}`}>
        {filtered.length === 0 ? (
          <p className="py-8 text-center text-sm text-slate-400">No applications match your search.</p>
        ) : (
          <div className="overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-100">
                  {["Application", "Category", "Access Level", "Status", "Last Accessed", ""].map(h => (
                    <th key={h} className="pb-3 text-left text-[11px] font-semibold uppercase tracking-wide text-slate-400">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filtered.map(app => (
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
                      <Badge variant={ACCESS_VARIANT[app.accessLevel]} size="xs">{app.accessLevel}</Badge>
                    </td>
                    <td className="py-3 pr-4">
                      <StatusBadge status={app.status.toLowerCase()} dot />
                    </td>
                    <td className="py-3 pr-4 text-xs text-slate-400">{app.lastAccessed}</td>
                    <td className="py-3">
                      <Button variant="secondary" size="xs" icon={ExternalLink} disabled={app.status === "Inactive"}>
                        Open
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </MemberCard>

      <Modal open={reqOpen} onClose={() => setReqOpen(false)}
        title="Request Application Access"
        footer={<><Button variant="secondary" onClick={() => setReqOpen(false)}>Cancel</Button><Button onClick={() => setReqOpen(false)}>Submit Request</Button></>}
      >
        <div className="flex flex-col gap-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Application Name</label>
            <input placeholder="e.g. NutriPay" className="w-full rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200" />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Business Justification</label>
            <textarea rows={3} placeholder="Explain why you need access…" className="w-full resize-none rounded-lg border border-slate-200 px-3 py-2 text-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200" />
          </div>
        </div>
      </Modal>
    </div>
  );
}
