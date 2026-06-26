"use client";

import { useEffect, useState } from "react";
import {
  CartesianGrid,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendingUp } from "lucide-react";

interface DataPoint {
  day: string;
  activeUsers: number;
  newRegistrations: number;
}

function buildSeries(): DataPoint[] {
  const points: DataPoint[] = [];
  for (let i = 0; i < 30; i++) {
    const wave = Math.sin(i / 3.5) * 8 + Math.sin(i / 8) * 4;
    points.push({
      day: `Day ${i + 1}`,
      activeUsers: Math.round(55 + i * 0.9 + wave),
      newRegistrations: Math.round(8 + Math.sin(i / 5 + 1) * 3 + i * 0.08),
    });
  }
  return points;
}

const SERIES = buildSeries();

export interface OrgActivityChartProps {
  periodLabel?: string;
}

export default function OrgActivityChart({ periodLabel = "Last 30 days" }: OrgActivityChartProps) {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setLoaded(true), 800);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <TrendingUp className="h-4 w-4 text-indigo-500" />
          User Activity Overview
        </h2>
        <span className="text-xs text-slate-400">{periodLabel}</span>
      </div>

      {!loaded ? (
        <div className="mt-4 h-64 animate-pulse rounded-lg bg-slate-100" />
      ) : (
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={SERIES} margin={{ top: 4, right: 8, bottom: 0, left: -16 }}>
              <CartesianGrid stroke="#e2e8f0" vertical={false} />
              <XAxis
                dataKey="day"
                tick={{ fontSize: 11, fill: "#94a3b8" }}
                tickLine={false}
                axisLine={{ stroke: "#e2e8f0" }}
                interval={4}
              />
              <YAxis tick={{ fontSize: 11, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e2e8f0" }} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              <Line
                type="monotone"
                dataKey="activeUsers"
                name="Active Users"
                stroke="#6366f1"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="newRegistrations"
                name="New Registrations"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="4 4"
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}
    </div>
  );
}
