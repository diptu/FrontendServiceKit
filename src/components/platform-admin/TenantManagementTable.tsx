"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Plus } from "lucide-react";
import Skeleton from "./Skeleton";

export interface TenantOverviewRow {
  id: string;
  name: string;
  plan: string;
  status: string;
  userCount: number;
  /** Pre-formatted display string, e.g. "Jan 15, 2024" -- built in page.tsx. */
  createdAt: string;
}

export interface TenantManagementTableProps {
  tenants: readonly TenantOverviewRow[];
}

const SIMULATED_FETCH_DELAY_MS = 900;

function statusBadgeStyle(status: string): string {
  return status === "active"
    ? "bg-green-50 text-green-700 border border-green-200"
    : "bg-slate-100 text-slate-600 border border-slate-200";
}

export default function TenantManagementTable({ tenants }: TenantManagementTableProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), SIMULATED_FETCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
        <h2 className="text-sm font-semibold text-slate-900">Tenants Overview</h2>
        <div className="flex items-center gap-4">
          <Link
            href="/admin/tenants/create"
            className="flex items-center gap-1 text-xs font-medium text-green-700 hover:text-green-800"
          >
            <Plus className="h-3.5 w-3.5" />
            Create Tenant
          </Link>
          <a href="#" className="text-xs font-medium text-green-700 hover:text-green-800">
            View all tenants
          </a>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 text-xs uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3 font-medium">Tenant</th>
              <th className="px-5 py-3 font-medium">Plan</th>
              <th className="px-5 py-3 font-medium">Status</th>
              <th className="px-5 py-3 font-medium">Users</th>
              <th className="px-5 py-3 font-medium">Created</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {isLoading
              ? Array.from({ length: 3 }).map((_, index) => (
                  <tr key={index}>
                    <td className="px-5 py-3.5">
                      <Skeleton className="h-4 w-28" />
                    </td>
                    <td className="px-5 py-3.5">
                      <Skeleton className="h-4 w-16" />
                    </td>
                    <td className="px-5 py-3.5">
                      <Skeleton className="h-5 w-16 rounded-full" />
                    </td>
                    <td className="px-5 py-3.5">
                      <Skeleton className="h-4 w-8" />
                    </td>
                    <td className="px-5 py-3.5">
                      <Skeleton className="h-4 w-24" />
                    </td>
                  </tr>
                ))
              : tenants.map((tenant) => (
                  <tr key={tenant.id}>
                    <td className="px-5 py-3.5 font-medium text-slate-900">{tenant.name}</td>
                    <td className="px-5 py-3.5 capitalize text-slate-600">{tenant.plan}</td>
                    <td className="px-5 py-3.5">
                      <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium capitalize ${statusBadgeStyle(tenant.status)}`}>
                        {tenant.status}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-600">{tenant.userCount}</td>
                    <td className="px-5 py-3.5 text-slate-500">{tenant.createdAt}</td>
                  </tr>
                ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
