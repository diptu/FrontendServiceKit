"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { AppWindow } from "lucide-react";
import { usePreviewUser } from "./PreviewUserContext";

export interface OrgAppRow {
  id: string;
  name: string;
  type: string;
  users: number;
  activeSessions: number;
  adoptionPct: number;
  status: "active" | "inactive";
}

const ALL_ORG_APPS: OrgAppRow[] = [
  { id: "a1", name: "NutraCRM",     type: "SaaS",       users: 445, activeSessions: 67, adoptionPct: 45, status: "active"   },
  { id: "a2", name: "SecurePass",   type: "Tool",       users: 398, activeSessions: 89, adoptionPct: 32, status: "active"   },
  { id: "a3", name: "WorkflowPro",  type: "Automation", users: 209, activeSessions: 34, adoptionPct: 17, status: "active"   },
  { id: "a4", name: "MediaManager", type: "Content",    users: 134, activeSessions: 22, adoptionPct: 11, status: "active"   },
  { id: "a5", name: "DataVault",    type: "Storage",    users: 62,  activeSessions: 8,  adoptionPct: 5,  status: "inactive" },
];

// Member only sees apps assigned to them
const MY_APPS: OrgAppRow[] = [
  { id: "a1", name: "NutraCRM",     type: "SaaS",    users: 445, activeSessions: 67, adoptionPct: 45, status: "active" },
  { id: "a3", name: "WorkflowPro",  type: "Automation", users: 209, activeSessions: 34, adoptionPct: 17, status: "active" },
  { id: "a4", name: "MediaManager", type: "Content", users: 134, activeSessions: 22, adoptionPct: 11, status: "active" },
];

export interface OrgTopAppsProps {
  orgSlug?: string;
}

export default function OrgTopApps({ orgSlug }: OrgTopAppsProps) {
  const { currentUser } = usePreviewUser();
  const isMember = currentUser.role === "member";
  const apps = isMember ? MY_APPS : ALL_ORG_APPS;
  const heading = isMember ? "My Applications" : "Top Applications";

  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const t = setTimeout(() => setLoaded(true), 700);
    return () => clearTimeout(t);
  }, [currentUser.role]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <AppWindow className="h-4 w-4 text-indigo-500" />
          {heading}
        </h2>
        {orgSlug && !isMember && (
          <Link href={`/org/${orgSlug}/applications`} className="text-[11px] font-medium text-indigo-600 hover:text-indigo-500">
            View all applications →
          </Link>
        )}
      </div>

      <div className="mt-4 overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-slate-100">
              <th className="pb-2 pr-4 font-semibold text-slate-500">Application</th>
              <th className="pb-2 pr-4 font-semibold text-slate-500">Type</th>
              {!isMember && <th className="pb-2 pr-4 text-right font-semibold text-slate-500">Users</th>}
              <th className="pb-2 pr-4 text-right font-semibold text-slate-500">Sessions</th>
              <th className="pb-2 pr-4 text-right font-semibold text-slate-500">Adoption</th>
              <th className="pb-2 font-semibold text-slate-500">Status</th>
            </tr>
          </thead>
          <tbody>
            {!loaded
              ? Array.from({ length: isMember ? 3 : 5 }).map((_, i) => (
                  <tr key={i} className="border-b border-slate-50">
                    {Array.from({ length: isMember ? 5 : 6 }).map((__, j) => (
                      <td key={j} className="py-3 pr-4">
                        <div className="h-3 w-full animate-pulse rounded bg-slate-100" />
                      </td>
                    ))}
                  </tr>
                ))
              : apps.map((app) => (
                  <tr key={app.id} className="border-b border-slate-50 last:border-0 hover:bg-slate-50/50">
                    <td className="py-3 pr-4 font-medium text-slate-800">{app.name}</td>
                    <td className="py-3 pr-4 text-slate-500">{app.type}</td>
                    {!isMember && <td className="py-3 pr-4 text-right text-slate-700">{app.users.toLocaleString()}</td>}
                    <td className="py-3 pr-4 text-right text-slate-700">{app.activeSessions}</td>
                    <td className="py-3 pr-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <div className="h-1.5 w-16 overflow-hidden rounded-full bg-slate-100">
                          <div className="h-full rounded-full bg-indigo-500" style={{ width: `${app.adoptionPct}%` }} />
                        </div>
                        <span className="text-slate-600">{app.adoptionPct}%</span>
                      </div>
                    </td>
                    <td className="py-3">
                      <span className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${app.status === "active" ? "bg-emerald-50 text-emerald-700" : "bg-slate-100 text-slate-500"}`}>
                        {app.status === "active" ? "Active" : "Inactive"}
                      </span>
                    </td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
