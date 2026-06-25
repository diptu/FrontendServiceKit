"use client";

import { useState, useEffect } from "react";
import PlatformAdminShell from "@/components/platform-admin/PlatformAdminShell";
import {
  AdminFooter,
  AdminTable,
  PageHeader,
  PreviewBanner,
  StatCard,
  StatGrid,
  StatusBadge,
  TabBar,
} from "@/components/platform-admin/ui";
import {
  Area, AreaChart, Bar, BarChart, CartesianGrid, Cell,
  Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis,
} from "recharts";
import { Ban, CreditCard, Download, Eye, Settings, TrendingUp, Users, XCircle } from "lucide-react";

const PLAN_COLORS: Record<string, string> = {
  Enterprise: "#7c3aed", Growth: "#2563eb", Starter: "#16a34a",
};

const MOCK_SUBS = [
  { id: "1", tenantName: "Apple Corp",      plan: "Enterprise", billingCycle: "Monthly", mrr: 2399, users: 4,  contractStart: "May 1, 2024",  contractEnd: "Jun 1, 2026",  nextBilling: "Jun 1, 2026",  payment: "Visa •••• 4532",        status: "Active" },
  { id: "2", tenantName: "Orange Teck",     plan: "Growth",     billingCycle: "Monthly", mrr: 499,  users: 3,  contractStart: "Mar 22, 2024", contractEnd: "Apr 22, 2026", nextBilling: "Jul 1, 2026",  payment: "Mastercard •••• 7891",  status: "Active" },
  { id: "3", tenantName: "Banana Republic", plan: "Starter",    billingCycle: "Monthly", mrr: 72,   users: 5,  contractStart: "Jun 10, 2024", contractEnd: "Jul 10, 2026", nextBilling: "Jul 10, 2026", payment: "Stripe ACH",            status: "Active" },
];

function buildMrrSeries() {
  return Array.from({ length: 30 }, (_, i) => ({
    day: `Jun ${i + 1}`,
    mrr: Math.round(2900 + Math.sin(i / 4) * 40 + i * 2.3),
  }));
}
const MRR_SERIES = buildMrrSeries();
const PLAN_DIST   = [{ name: "Enterprise", value: 1, fill: PLAN_COLORS.Enterprise }, { name: "Growth", value: 1, fill: PLAN_COLORS.Growth }, { name: "Starter", value: 1, fill: PLAN_COLORS.Starter }];
const REVENUE_PIE = [{ name: "Enterprise", revenue: 2399, fill: PLAN_COLORS.Enterprise }, { name: "Growth", revenue: 499, fill: PLAN_COLORS.Growth }, { name: "Starter", revenue: 72, fill: PLAN_COLORS.Starter }];
const STATUS_COLORS: Record<string, string> = { Active: "bg-emerald-50 text-emerald-700", Trialing: "bg-blue-50 text-blue-700", Cancelled: "bg-red-50 text-red-700" };
const FILTER_TABS = ["All", "Active", "Cancelled", "Free"];

export default function SubscriptionsPage() {
  const [mounted, setMounted] = useState(false);
  const [filter, setFilter] = useState("All");
  useEffect(() => setMounted(true), []);

  const mrr       = MOCK_SUBS.reduce((s, sub) => s + sub.mrr, 0);
  const arr       = mrr * 12;
  const active    = MOCK_SUBS.filter((s) => s.status === "Active").length;
  const cancelled = MOCK_SUBS.filter((s) => s.status === "Cancelled").length;
  const filtered  = filter === "All" ? MOCK_SUBS : MOCK_SUBS.filter((s) => s.status === filter);

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId="preview">
      <div className="flex flex-col gap-6">
        <PreviewBanner>Preview mode — Subscriptions dashboard. Auth gate disabled for local dev.</PreviewBanner>

        <PageHeader
          title="Subscriptions"
          subtitle="Monitor and manage all tenant subscriptions and billing."
          actions={
            <>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-sm font-medium text-slate-600 shadow-sm hover:bg-slate-50">
                <Download className="h-4 w-4" /> Export
              </button>
              <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
                <Settings className="h-4 w-4" /> Manage Plans
              </button>
            </>
          }
        />

        <StatGrid cols={5}>
          <StatCard icon={CreditCard} value={`$${mrr.toLocaleString()}`} label="MRR"                  sub="Monthly recurring revenue" bg="bg-violet-50"  color="text-violet-600"  />
          <StatCard icon={TrendingUp} value={`$${arr.toLocaleString()}`} label="Total ARR"             sub="Annual recurring revenue"  bg="bg-blue-50"    color="text-blue-600"    />
          <StatCard icon={Users}      value={active}                      label="Active Subscriptions"  sub="Paid plans"               bg="bg-emerald-50" color="text-emerald-600" />
          <StatCard icon={XCircle}    value={0}                           label="Free Tier"             sub="Free-plan tenants"         bg="bg-gray-50"    color="text-gray-500"    />
          <StatCard icon={Ban}        value={cancelled}                   label="Cancelled"             sub="Churned this period"       bg="bg-red-50"     color="text-red-600"     />
        </StatGrid>

        {/* Charts */}
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-5">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-slate-900">MRR Over Time</h2>
              <span className="text-xs text-slate-400">Last 30 days</span>
            </div>
            {mounted ? (
              <div className="mt-4 h-52">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={MRR_SERIES} margin={{ top: 4, right: 8, bottom: 0, left: -10 }}>
                    <defs>
                      <linearGradient id="mrrGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor="#7c3aed" stopOpacity={0.15} />
                        <stop offset="95%" stopColor="#7c3aed" stopOpacity={0}    />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={{ stroke: "#e2e8f0" }} interval={4} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} tickLine={false} axisLine={false} tickFormatter={(v) => `$${v}`} />
                    <Tooltip formatter={(v) => [`$${v}`, "MRR"]} contentStyle={{ fontSize: 12, borderRadius: 8, borderColor: "#e2e8f0" }} />
                    <Area type="monotone" dataKey="mrr" stroke="#7c3aed" strokeWidth={2} fill="url(#mrrGrad)" dot={false} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="mt-4 h-52 animate-pulse rounded-lg bg-slate-100" />}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="text-sm font-semibold text-slate-900">By Plan</h2>
            {mounted ? (
              <>
                <div className="mt-4 flex justify-center">
                  <PieChart width={140} height={140}>
                    <Pie data={PLAN_DIST} cx={65} cy={65} innerRadius={42} outerRadius={62} dataKey="value" strokeWidth={0}>
                      {PLAN_DIST.map((e) => <Cell key={e.name} fill={e.fill} />)}
                    </Pie>
                    <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                  </PieChart>
                </div>
                <div className="mt-2 flex flex-col gap-1.5">
                  {PLAN_DIST.map((p) => (
                    <div key={p.name} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="h-2 w-2 rounded-full" style={{ background: p.fill }} />{p.name}
                    </div>
                  ))}
                </div>
              </>
            ) : <div className="mt-4 h-36 animate-pulse rounded-lg bg-slate-100" />}
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm lg:col-span-1">
            <h2 className="text-sm font-semibold text-slate-900">Revenue by Plan</h2>
            {mounted ? (
              <div className="mt-4 h-36">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={REVENUE_PIE} margin={{ top: 0, right: 0, bottom: 0, left: -24 }}>
                    <XAxis dataKey="name" tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                    <YAxis tick={{ fontSize: 9, fill: "#94a3b8" }} tickLine={false} axisLine={false} />
                    <Tooltip formatter={(v) => [`$${v}`, "MRR"]} contentStyle={{ fontSize: 11, borderRadius: 8, borderColor: "#e2e8f0" }} />
                    <Bar dataKey="revenue" radius={[4, 4, 0, 0]}>{REVENUE_PIE.map((e) => <Cell key={e.name} fill={e.fill} />)}</Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : <div className="mt-4 h-36 animate-pulse rounded-lg bg-slate-100" />}
          </div>
        </div>

        <AdminTable
          title="Subscription Records"
          toolbar={<TabBar tabs={FILTER_TABS.map((l) => ({ label: l }))} active={filter} onChange={setFilter} />}
          footer={<p className="text-xs text-slate-400">Showing {filtered.length} of {MOCK_SUBS.length} records</p>}
        >
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-100 bg-slate-50">
                {["Tenant", "Plan", "Billing Cycle", "MRR", "Users", "Contract Period", "Next Billing", "Payment", "Status", "Actions"].map((h) => (
                  <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map((sub) => (
                <tr key={sub.id} className="transition-colors hover:bg-slate-50">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">{sub.tenantName.charAt(0)}</div>
                      <span className="font-semibold text-slate-900">{sub.tenantName}</span>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span className="inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold" style={{ background: `${PLAN_COLORS[sub.plan]}1A`, color: PLAN_COLORS[sub.plan] }}>{sub.plan}</span>
                  </td>
                  <td className="px-5 py-4 text-slate-600">{sub.billingCycle}</td>
                  <td className="px-5 py-4 font-semibold text-slate-900">${sub.mrr.toLocaleString()}</td>
                  <td className="px-5 py-4 text-slate-600">{sub.users}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{sub.contractStart} – {sub.contractEnd}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{sub.nextBilling}</td>
                  <td className="px-5 py-4 text-xs text-slate-500">{sub.payment}</td>
                  <td className="px-5 py-4"><StatusBadge status={sub.status} colorMap={STATUS_COLORS} /></td>
                  <td className="px-5 py-4">
                    <button type="button" className="inline-flex items-center gap-1 rounded-md border border-slate-200 px-2.5 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50">
                      <Eye className="h-3 w-3" /> View
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </AdminTable>

        <AdminFooter />
      </div>
    </PlatformAdminShell>
  );
}
