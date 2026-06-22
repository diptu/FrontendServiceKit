"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";
import Skeleton from "./Skeleton";

export interface RoleBreakdownEntry {
  role: string;
  count: number;
}

export interface UsersByRoleChartProps {
  breakdown: readonly RoleBreakdownEntry[];
  total: number;
}

const ROLE_COLORS: Readonly<Record<string, string>> = {
  Admin: "#16a34a",
  Moderator: "#4ade80",
  Member: "#94a3b8",
  User: "#cbd5e1",
};

const FALLBACK_COLOR = "#cbd5e1";
const SIMULATED_FETCH_DELAY_MS = 750;

export default function UsersByRoleChart({ breakdown, total }: UsersByRoleChartProps) {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), SIMULATED_FETCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <PieChartIcon className="h-4 w-4 text-green-600" />
        Users by Role
      </h2>
      <p className="text-xs text-slate-400">All Tenants</p>

      {isLoading ? (
        <Skeleton className="mx-auto mt-4 h-44 w-44 rounded-full" />
      ) : (
        <>
          <div className="relative mx-auto mt-2 h-44 w-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={breakdown} dataKey="count" nameKey="role" innerRadius={55} outerRadius={80} paddingAngle={2}>
                  {breakdown.map((entry) => (
                    <Cell key={entry.role} fill={ROLE_COLORS[entry.role] ?? FALLBACK_COLOR} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-semibold text-slate-900">{total}</span>
              <span className="text-[11px] text-slate-400">Users</span>
            </div>
          </div>

          <ul className="mt-4 flex flex-col gap-2">
            {breakdown.map((entry) => (
              <li key={entry.role} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span
                    className="h-2.5 w-2.5 rounded-full"
                    style={{ backgroundColor: ROLE_COLORS[entry.role] ?? FALLBACK_COLOR }}
                  />
                  {entry.role}
                </span>
                <span className="font-medium text-slate-800">{entry.count}</span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
