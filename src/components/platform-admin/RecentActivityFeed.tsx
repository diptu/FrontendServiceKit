"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";
import Skeleton from "./Skeleton";

export type ActivityStatus = "success" | "info" | "alert";

export interface RecentActivityEntry {
  id: string;
  message: string;
  status: ActivityStatus;
  timestamp: string;
}

// Decorative mock feed -- a broader "what's happening" view than the
// tenant-scoped audit_logs table (see app/[tenant]/(dashboard)/audit-logs),
// not a real cross-tenant activity query.
const ACTIVITY_ENTRIES: readonly RecentActivityEntry[] = [
  { id: "act-1", message: "Policy updated for Apple Corp", status: "success", timestamp: "12m ago" },
  { id: "act-2", message: "User invited to Orange Teck", status: "info", timestamp: "48m ago" },
  { id: "act-3", message: "Tenant created: Banana Republic", status: "success", timestamp: "2h ago" },
  { id: "act-4", message: "Account locked after failed MFA attempts", status: "alert", timestamp: "5h ago" },
  { id: "act-5", message: "API secret rotated for Orange Teck", status: "info", timestamp: "1d ago" },
];

const STATUS_DOT_STYLES: Record<ActivityStatus, string> = {
  success: "bg-green-500",
  info: "bg-blue-500",
  alert: "bg-red-500",
};

const SIMULATED_FETCH_DELAY_MS = 700;

export default function RecentActivityFeed() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), SIMULATED_FETCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Activity className="h-4 w-4 text-green-600" />
        Recent Activity
      </h2>

      <div className="mt-4 flex flex-col gap-3">
        {isLoading
          ? Array.from({ length: 4 }).map((_, index) => (
              <div key={index} className="flex items-start gap-2.5">
                <Skeleton className="mt-1 h-2 w-2 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-3.5 w-full" />
                  <Skeleton className="mt-1.5 h-3 w-12" />
                </div>
              </div>
            ))
          : ACTIVITY_ENTRIES.map((entry) => (
              <div key={entry.id} className="flex items-start gap-2.5">
                <span className={`mt-1.5 h-2 w-2 shrink-0 rounded-full ${STATUS_DOT_STYLES[entry.status]}`} />
                <div className="flex-1">
                  <p className="text-xs text-slate-700">{entry.message}</p>
                  <p className="mt-0.5 text-[11px] text-slate-400">{entry.timestamp}</p>
                </div>
              </div>
            ))}
      </div>
    </div>
  );
}
