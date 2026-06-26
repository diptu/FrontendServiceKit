"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

export type OrgActivityKind = "success" | "info" | "alert" | "warning";

export interface OrgActivityEntry {
  id: string;
  message: string;
  detail?: string;
  kind: OrgActivityKind;
  timestamp: string;
}

const DEFAULT_ENTRIES: OrgActivityEntry[] = [
  { id: "e1", message: "New user added",              detail: "alice.w@nutracorp.test joined",                kind: "success", timestamp: "12 min ago"  },
  { id: "e2", message: "Application access granted",  detail: "NutraCRM access for marketing team",          kind: "info",    timestamp: "3 min ago"   },
  { id: "e3", message: "User status updated",         detail: "bob.k@nutracorp.test set to suspended",       kind: "warning", timestamp: "25 min ago"  },
  { id: "e4", message: "MFA configuration updated",   detail: "TOTP enforced for Admin role",                kind: "info",    timestamp: "34 min ago"  },
  { id: "e5", message: "New user added",              detail: "charlie.n@nutracorp.test joined",             kind: "success", timestamp: "1 hr ago"    },
  { id: "e6", message: "Super admin access granted",  detail: "Temporary elevated access for audit review",  kind: "alert",   timestamp: "1 day ago"   },
];

const KIND_DOT: Record<OrgActivityKind, string> = {
  success: "bg-emerald-500",
  info:    "bg-blue-500",
  alert:   "bg-red-500",
  warning: "bg-amber-400",
};

export interface OrgRecentActivityProps {
  entries?: OrgActivityEntry[];
  orgSlug?: string;
}

export default function OrgRecentActivity({ entries = DEFAULT_ENTRIES, orgSlug }: OrgRecentActivityProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <Activity className="h-4 w-4 text-indigo-500" />
          Recent Activity
        </h2>
        {orgSlug && (
          <button type="button" className="text-[11px] font-medium text-indigo-600 hover:text-indigo-500">
            View all activity →
          </button>
        )}
      </div>

      <div className="mt-4 flex flex-col gap-4">
        {!loaded
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-start gap-2.5">
                <div className="mt-1.5 h-2 w-2 shrink-0 animate-pulse rounded-full bg-slate-200" />
                <div className="flex-1 space-y-1.5">
                  <div className="h-3 w-3/4 animate-pulse rounded bg-slate-100" />
                  <div className="h-2.5 w-1/2 animate-pulse rounded bg-slate-100" />
                  <div className="h-2.5 w-16 animate-pulse rounded bg-slate-100" />
                </div>
              </div>
            ))
          : entries.map((entry) => (
              <div key={entry.id} className="flex items-start gap-2.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${KIND_DOT[entry.kind]}`} />
                <div className="flex-1">
                  <p className="text-xs font-medium text-slate-800">{entry.message}</p>
                  {entry.detail && (
                    <p className="mt-0.5 text-[11px] text-slate-500">{entry.detail}</p>
                  )}
                  <p className="mt-0.5 text-[11px] text-slate-400">{entry.timestamp}</p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
