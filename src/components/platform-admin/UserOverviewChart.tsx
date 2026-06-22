"use client";

import { useEffect, useState } from "react";
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { TrendingUp } from "lucide-react";
import Skeleton from "./Skeleton";

interface DailyUserPoint {
  day: string;
  activeUsers: number;
  newUsers: number;
}

const DAY_COUNT = 30;

/**
 * Decorative mock time series -- there's no "daily active/new users" metric
 * tracked anywhere in this schema (User has no last-seen/created-on-day
 * granularity exposed here), so this is a deterministic synthetic wave
 * (no Math.random()) rather than a real query, purely so the chart has
 * something plausible to render.
 */
function buildMockSeries(): DailyUserPoint[] {
  const points: DailyUserPoint[] = [];

  for (let day = 0; day < DAY_COUNT; day += 1) {
    const wave = Math.sin(day / 4) * 6 + Math.sin(day / 9) * 3;
    const activeUsers = Math.round(28 + day * 0.6 + wave);
    const newUsers = Math.round(4 + Math.sin(day / 6 + 1) * 2 + day * 0.05);

    points.push({ day: `Day ${day + 1}`, activeUsers, newUsers: Math.max(newUsers, 0) });
  }

  return points;
}

const SERIES = buildMockSeries();
const SIMULATED_FETCH_DELAY_MS = 800;

export default function UserOverviewChart() {
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), SIMULATED_FETCH_DELAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-center justify-between">
        <h2 className="flex items-center gap-2 text-sm font-semibold text-slate-900">
          <TrendingUp className="h-4 w-4 text-green-600" />
          User Overview
        </h2>
        <span className="text-xs text-slate-400">Last 30 days</span>
      </div>

      {isLoading ? (
        <Skeleton className="mt-4 h-72 w-full" />
      ) : (
        <div className="mt-4 h-72">
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
                stroke="#16a34a"
                strokeWidth={2}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="newUsers"
                name="New Users"
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
