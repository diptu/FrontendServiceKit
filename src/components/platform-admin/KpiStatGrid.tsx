"use client";

import { useEffect, useState } from "react";
import { Building2, TrendingUp, Users, type LucideIcon } from "lucide-react";
import Skeleton from "./Skeleton";

export interface KpiStatGridProps {
  totalTenants: number;
  totalUsers: number;
}

interface KpiMetric {
  id: string;
  label: string;
  value: string;
  delta?: string;
  icon: LucideIcon;
}

// "Active Roles" and "Policy Decisions" are decorative -- there's no
// per-role-activation or per-PDP-evaluation tracking in the schema to back
// these with real numbers, unlike Total Tenants/Total Users below.
const ACTIVE_ROLES_COUNT = 12;
const POLICY_DECISIONS = { value: "12,458", delta: "+8%" };

const SIMULATED_FETCH_DELAY_MS = 700;

function KpiCardSkeleton() {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5">
      <Skeleton className="h-4 w-28" />
      <Skeleton className="mt-3 h-7 w-20" />
      <Skeleton className="mt-2 h-3 w-32" />
    </div>
  );
}

export default function KpiStatGrid({ totalTenants, totalUsers }: KpiStatGridProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), SIMULATED_FETCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  const metrics: readonly KpiMetric[] = [
    { id: "tenants", label: "Total Tenants", value: String(totalTenants), icon: Building2 },
    { id: "users", label: "Total Users", value: totalUsers.toLocaleString(), icon: Users },
    { id: "roles", label: "Active Roles", value: String(ACTIVE_ROLES_COUNT), icon: Users },
    { id: "decisions", label: "Policy Decisions", value: POLICY_DECISIONS.value, delta: POLICY_DECISIONS.delta, icon: TrendingUp },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {isLoading
        ? Array.from({ length: 4 }).map((_, index) => <KpiCardSkeleton key={index} />)
        : metrics.map((metric) => {
            const Icon = metric.icon;
            return (
              <div key={metric.id} className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{metric.label}</p>
                  <Icon className="h-4 w-4 text-green-600" strokeWidth={1.75} />
                </div>
                <p className="mt-3 text-2xl font-semibold tracking-tight text-slate-900">{metric.value}</p>
                {metric.delta && <p className="mt-1 text-xs font-medium text-green-600">{metric.delta}</p>}
              </div>
            );
          })}
    </div>
  );
}
