"use client";

import { useParams } from "next/navigation";
import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import { AppWindow, Plus, Search } from "lucide-react";
import { usePreviewUser } from "@/components/org/PreviewUserContext";

const ALL_APPS = [
  { id: "a1", name: "NutraCRM",     type: "SaaS",       users: 445, sessions: 67,  adoptionPct: 45, lastActivity: "2 min ago",  status: "active"   },
  { id: "a2", name: "SecurePass",   type: "Tool",       users: 398, sessions: 89,  adoptionPct: 32, lastActivity: "10 min ago", status: "active"   },
  { id: "a3", name: "WorkflowPro",  type: "Automation", users: 209, sessions: 34,  adoptionPct: 17, lastActivity: "1 hr ago",   status: "active"   },
  { id: "a4", name: "MediaManager", type: "Content",    users: 134, sessions: 22,  adoptionPct: 11, lastActivity: "3 hr ago",   status: "active"   },
  { id: "a5", name: "DataVault",    type: "Storage",    users: 62,  sessions: 8,   adoptionPct: 5,  lastActivity: "2 days ago", status: "inactive" },
  { id: "a6", name: "AnalyticsHub", type: "Analytics",  users: 89,  sessions: 14,  adoptionPct: 7,  lastActivity: "5 hr ago",   status: "active"   },
];

const MY_APPS = ALL_APPS.filter(a => ["a1", "a3", "a4"].includes(a.id));

export default function ApplicationsPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { currentUser } = usePreviewUser();
  const isMember = currentUser.role === "member";
  const apps = isMember ? MY_APPS : ALL_APPS;
  const display = orgSlug.split("-").map((w: string) => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>Preview mode — application management is read-only until role gates are enforced.</PreviewBanner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <AppWindow className="h-5 w-5 text-indigo-500" />
            {isMember ? "My Applications" : "Applications"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isMember ? "Apps assigned to your account in" : "All registered applications in"}{" "}
            <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        {!isMember && (
          <button type="button" className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition-colors">
            <Plus className="h-4 w-4" />Add Application
          </button>
        )}
      </div>

      <div className="flex items-center gap-3">
        <div className="relative max-w-sm flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input type="text" placeholder="Search applications..." className="w-full rounded-lg border border-slate-200 bg-white py-2 pl-9 pr-3 text-sm placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500" />
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {apps.map(app => (
          <div key={app.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm hover:shadow-md transition-shadow">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg font-bold text-indigo-700">
                  {app.name[0]}
                </div>
                <div>
                  <p className="font-semibold text-slate-900">{app.name}</p>
                  <p className="text-xs text-slate-400">{app.type}</p>
                </div>
              </div>
              <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-semibold ${app.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                {app.status}
              </span>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-xs">
              {!isMember && (
                <div className="rounded-lg bg-slate-50 p-2.5">
                  <p className="text-slate-400">Users</p>
                  <p className="mt-0.5 font-semibold text-slate-900">{app.users.toLocaleString()}</p>
                </div>
              )}
              <div className="rounded-lg bg-slate-50 p-2.5">
                <p className="text-slate-400">Sessions</p>
                <p className="mt-0.5 font-semibold text-slate-900">{app.sessions}</p>
              </div>
              <div className={`rounded-lg bg-slate-50 p-2.5 ${isMember ? "col-span-2" : ""}`}>
                <p className="text-slate-400">Last activity</p>
                <p className="mt-0.5 font-semibold text-slate-900">{app.lastActivity}</p>
              </div>
            </div>

            <div className="mt-3">
              <div className="mb-1 flex items-center justify-between text-xs">
                <span className="text-slate-400">Adoption</span>
                <span className="font-medium text-slate-700">{app.adoptionPct}%</span>
              </div>
              <div className="h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div className="h-full rounded-full bg-indigo-500 transition-all" style={{ width: `${app.adoptionPct}%` }} />
              </div>
            </div>

            <button type="button" className="mt-4 w-full rounded-lg border border-slate-200 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50 transition-colors">
              {isMember ? "Open App" : "Manage"}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
