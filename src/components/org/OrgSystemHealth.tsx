"use client";

import { useEffect, useState } from "react";
import { Activity } from "lucide-react";

export type ServiceStatus = "healthy" | "degraded" | "outage";

export interface ServiceHealthEntry {
  id: string;
  name: string;
  status: ServiceStatus;
}

const DEFAULT_SERVICES: ServiceHealthEntry[] = [
  { id: "auth",    name: "Authentication", status: "healthy"  },
  { id: "gateway", name: "API Gateway",    status: "healthy"  },
  { id: "db",      name: "Database",       status: "healthy"  },
  { id: "sync",    name: "Sync Service",   status: "degraded" },
  { id: "email",   name: "Email Service",  status: "healthy"  },
];

const STATUS_STYLES: Record<ServiceStatus, { dot: string; badge: string; label: string }> = {
  healthy:  { dot: "bg-emerald-500", badge: "bg-emerald-50 text-emerald-700",  label: "Healthy"  },
  degraded: { dot: "bg-amber-400",   badge: "bg-amber-50  text-amber-700",    label: "Degraded" },
  outage:   { dot: "bg-red-500",     badge: "bg-red-50    text-red-700",      label: "Outage"   },
};

export interface OrgSystemHealthProps {
  services?: ServiceHealthEntry[];
}

export default function OrgSystemHealth({ services = DEFAULT_SERVICES }: OrgSystemHealthProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 700);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <Activity className="h-4 w-4 text-indigo-500" />
        System Health
      </h2>
      <p className="text-xs text-slate-400">Live service status</p>

      <div className="mt-4 flex flex-col gap-3">
        {!loaded
          ? Array.from({ length: 5 }).map((_, i) => (
              <div key={i} className="flex items-center justify-between">
                <div className="h-3 w-28 animate-pulse rounded bg-slate-100" />
                <div className="h-5 w-16 animate-pulse rounded-full bg-slate-100" />
              </div>
            ))
          : services.map((svc) => {
              const s = STATUS_STYLES[svc.status];
              return (
                <div key={svc.id} className="flex items-center justify-between">
                  <span className="flex items-center gap-2 text-sm text-slate-700">
                    <span className={`h-2 w-2 rounded-full ${s.dot}`} />
                    {svc.name}
                  </span>
                  <span className={`rounded-full px-2.5 py-0.5 text-[11px] font-semibold ${s.badge}`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
      </div>

      <button type="button" className="mt-4 w-full text-center text-[11px] font-medium text-indigo-600 hover:text-indigo-500">
        View system status →
      </button>
    </div>
  );
}
