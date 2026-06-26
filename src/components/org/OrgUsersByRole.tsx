"use client";

import { useEffect, useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { PieChart as PieChartIcon } from "lucide-react";

export interface RoleSlice {
  role: string;
  count: number;
  color: string;
}

export interface OrgUsersByRoleProps {
  slices?: RoleSlice[];
  total?: number;
}

const DEFAULT_SLICES: RoleSlice[] = [
  { role: "Admin",     count: 312,  color: "#6366f1" },
  { role: "Moderator", count: 213,  color: "#818cf8" },
  { role: "Member",    count: 514,  color: "#c7d2fe" },
  { role: "Storage",   count: 209,  color: "#e2e8f0" },
];

const DEFAULT_TOTAL = DEFAULT_SLICES.reduce((s, r) => s + r.count, 0);

export default function OrgUsersByRole({
  slices = DEFAULT_SLICES,
  total = DEFAULT_TOTAL,
}: OrgUsersByRoleProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 750);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
        <PieChartIcon className="h-4 w-4 text-indigo-500" />
        Users by Role
      </h2>
      <p className="text-xs text-slate-400">All roles in this organization</p>

      {!loaded ? (
        <div className="mx-auto mt-4 h-44 w-44 animate-pulse rounded-full bg-slate-100" />
      ) : (
        <>
          <div className="relative mx-auto mt-2 h-44 w-44">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={slices}
                  dataKey="count"
                  nameKey="role"
                  innerRadius={54}
                  outerRadius={78}
                  paddingAngle={2}
                >
                  {slices.map((s) => (
                    <Cell key={s.role} fill={s.color} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e2e8f0" }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-bold text-slate-900">{total.toLocaleString()}</span>
              <span className="text-[11px] text-slate-400">Total</span>
            </div>
          </div>

          <ul className="mt-4 flex flex-col gap-2">
            {slices.map((s) => (
              <li key={s.role} className="flex items-center justify-between text-xs">
                <span className="flex items-center gap-2 text-slate-600">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ backgroundColor: s.color }} />
                  {s.role}
                </span>
                <span className="font-semibold text-slate-800">{s.count.toLocaleString()}</span>
              </li>
            ))}
          </ul>

          <button type="button" className="mt-4 w-full text-center text-[11px] font-medium text-indigo-600 hover:text-indigo-500">
            View all roles →
          </button>
        </>
      )}
    </div>
  );
}
