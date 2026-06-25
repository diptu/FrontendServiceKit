"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  AppWindow, Clock, FileText, Fingerprint, KeyRound, Lock,
  LogIn, LogOut, MonitorSmartphone, Search, ShieldAlert, ShieldCheck, UserRound,
} from "lucide-react";
import {
  Cell, LineChart, Line, PieChart, Pie, ResponsiveContainer,
  Tooltip, XAxis, YAxis, CartesianGrid,
} from "recharts";
import {
  MemberStatCard, MemberCard, ActivityItem, SecurityStatusItem,
} from "@/components/member/ui";

// ─── Mock data ────────────────────────────────────────────────────────────────

const APPS = [
  { id:"a1", name:"NutriTrack",  description:"Financial Management",     initials:"N", color:"bg-emerald-500", accessLevel:"Full Access" as const, status:"Active" as const },
  { id:"a2", name:"NutriFlex",   description:"Nutritional Management",   initials:"N", color:"bg-emerald-500", accessLevel:"Full Access" as const, status:"Active" as const },
  { id:"a3", name:"NutriAdmin",  description:"Admin Control Portal",     initials:"N", color:"bg-emerald-500", accessLevel:"Read Only"  as const, status:"Active" as const },
  { id:"a4", name:"NutriCalc",   description:"Calorie & Macro Tracker",  initials:"N", color:"bg-emerald-500", accessLevel:"Read Only"  as const, status:"Active" as const },
];

// 24 total permissions → Full Access 8 (33%), Read Only 10 (42%), No Access 6 (25%)
const ACCESS_PIE = [
  { name:"Full Access", value:8,  pct:"33%", fill:"#6366f1" },
  { name:"Read Only",   value:10, pct:"42%", fill:"#3b82f6" },
  { name:"No Access",   value:6,  pct:"25%", fill:"#e2e8f0" },
];

const ACTIVITY = [
  { icon:LogIn,       iconBg:"bg-emerald-50", iconColor:"text-emerald-600", title:"Logged in successfully",         description:"Chrome · macOS · 192.168.1.10",   time:"Today, 09:17" },
  { icon:AppWindow,   iconBg:"bg-indigo-50",  iconColor:"text-indigo-600",  title:"Accessed NutriTrack",           description:"Opened dashboard view",           time:"Today, 09:27" },
  { icon:AppWindow,   iconBg:"bg-blue-50",    iconColor:"text-blue-600",    title:"Accessed NutriFlex",            description:"Ran monthly summary report",      time:"Today, 09:33" },
  { icon:Fingerprint, iconBg:"bg-violet-50",  iconColor:"text-violet-600",  title:"MFA verification successful",   description:"TOTP method used",               time:"Today, 09:46" },
  { icon:FileText,    iconBg:"bg-slate-100",  iconColor:"text-slate-600",   title:"Updated display name",          description:"Profile setting changed",         time:"Yesterday" },
  { icon:LogOut,      iconBg:"bg-orange-50",  iconColor:"text-orange-600",  title:"Session expired",               description:"Idle timeout · Windows PC",      time:"Jun 22" },
  { icon:Lock,        iconBg:"bg-green-50",   iconColor:"text-green-600",   title:"Password changed",              description:"Via security settings",           time:"Jun 23" },
  { icon:ShieldAlert, iconBg:"bg-red-50",     iconColor:"text-red-600",     title:"Suspicious login blocked",      description:"Unknown IP · 91.240.20.43 · RU", time:"Jun 21" },
];

const LOGIN_CHART = [
  { day:"May 2",  logins:2 }, { day:"May 4",  logins:5 },
  { day:"May 9",  logins:3 }, { day:"May 20", logins:4 },
  { day:"Jun 10", logins:6 }, { day:"Jun 20", logins:4 },
  { day:"Jun 25", logins:5 },
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function MemberDashboardPage() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  return (
    <div className="flex flex-col gap-5">
      {/* Preview banner */}
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
        Preview mode — Member Dashboard. Auth gate disabled for local dev.
      </div>

      {/* Search bar */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          readOnly
          placeholder="Search users, groups, applications..."
          className="w-full rounded-xl border border-slate-200 bg-white py-2.5 pl-10 pr-4 text-sm text-slate-800 shadow-sm outline-none focus:border-indigo-400 focus:ring-1 focus:ring-indigo-200"
        />
      </div>

      {/* Welcome header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Welcome back, John! <span aria-hidden>👋</span>
          </h1>
          <p className="mt-0.5 text-sm text-slate-500">
            {"Here's what's happening in your account today."}
          </p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1.5 text-xs font-medium text-slate-500 shadow-sm">
          <Clock className="h-3.5 w-3.5" /> Last 7 days
        </span>
      </div>

      {/* ── Stat cards ── */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MemberStatCard
          icon={AppWindow}        value={8}  label="Applications"
          sub="8 assigned"            href="/member/applications" hrefLabel="View all applications"
        />
        <MemberStatCard
          icon={UserRound}         value={5}  label="Groups"
          sub="Active groups"         href="/member/groups"       hrefLabel="View all groups"
          iconBg="bg-violet-50"  iconColor="text-violet-600"
        />
        <MemberStatCard
          icon={KeyRound}          value={24} label="Permissions"
          sub="Active permissions"    href="/member/security"     hrefLabel="View all permissions"
          iconBg="bg-emerald-50" iconColor="text-emerald-600"
        />
        <MemberStatCard
          icon={MonitorSmartphone} value={2}  label="Active Sessions"
          sub="Devices active"        href="/member/sessions"     hrefLabel="View all sessions"
          iconBg="bg-amber-50"   iconColor="text-amber-600"
        />
      </div>

      {/* ── 3-column main row ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Col 1 — My Applications */}
        <MemberCard title="My Applications" viewAllHref="/member/applications">
          <div className="flex flex-col divide-y divide-slate-100">
            {APPS.map((app) => (
              <div key={app.id} className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
                <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-sm font-bold text-white ${app.color}`}>
                  {app.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-slate-900">{app.name}</p>
                  <p className="text-[11px] text-slate-400 truncate">{app.description}</p>
                </div>
                <button
                  type="button"
                  className="shrink-0 rounded-md border border-indigo-200 bg-indigo-50 px-3 py-1.5 text-[11px] font-semibold text-indigo-700 hover:bg-indigo-100"
                >
                  Open
                </button>
              </div>
            ))}
          </div>
          <Link href="/member/applications" className="mt-3 block text-center text-[11px] font-medium text-indigo-600 hover:underline">
            View All Applications →
          </Link>
        </MemberCard>

        {/* Col 2 — Recent Activity */}
        <MemberCard title="Recent Activity" viewAllHref="/member/sessions" viewAllLabel="View All">
          <div className="flex flex-col gap-3">
            {ACTIVITY.map((item, i) => (
              <ActivityItem key={i} {...item} last={i === ACTIVITY.length - 1} />
            ))}
          </div>
        </MemberCard>

        {/* Col 3 — Security Status */}
        <MemberCard
          title="Security Status"
          footer={
            <Link href="/member/security" className="flex items-center justify-center text-xs font-medium text-indigo-600 hover:underline">
              Manage security →
            </Link>
          }
        >
          <div className="flex flex-col">
            <SecurityStatusItem
              icon={Fingerprint}
              label="Multi-Factor Authentication"
              value="TOTP enabled"
              badge={{ text: "Enabled", color: "bg-emerald-50 text-emerald-700" }}
            />
            <SecurityStatusItem
              icon={MonitorSmartphone}
              label="Active Sessions"
              value="2 devices signed in"
              action={{ label: "View →" }}
            />
            <SecurityStatusItem
              icon={ShieldCheck}
              label="Active Threats"
              value="1 blocked login — Jun 21"
              badge={{ text: "0 Active", color: "bg-slate-100 text-slate-600" }}
            />
            <SecurityStatusItem
              icon={Lock}
              label="Recent Password Change"
              value="Jun 23, 2026"
              action={{ label: "Change →" }}
              last
            />
          </div>
        </MemberCard>
      </div>

      {/* ── Bottom row: Access Overview + Login Activity ── */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">

        {/* Access Overview — 1/3 */}
        <MemberCard title="Access Overview">
          <div className="flex items-center gap-6">
            {/* Donut */}
            <div className="relative flex h-32 w-32 shrink-0 items-center justify-center">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={ACCESS_PIE} cx="50%" cy="50%"
                      innerRadius={32} outerRadius={52}
                      paddingAngle={2} dataKey="value" startAngle={90} endAngle={-270}
                    >
                      {ACCESS_PIE.map((e) => <Cell key={e.name} fill={e.fill} />)}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-32 w-32 animate-pulse rounded-full bg-slate-100" />
              )}
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-900">24</span>
                <span className="text-[10px] text-slate-400">permissions</span>
              </div>
            </div>

            {/* Legend */}
            <div className="flex flex-col gap-2.5">
              {ACCESS_PIE.map((e) => (
                <div key={e.name} className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 shrink-0 rounded-sm" style={{ background: e.fill }} />
                  <div>
                    <p className="text-[11px] font-medium text-slate-700">{e.name}</p>
                    <p className="text-[10px] text-slate-400">{e.value} · {e.pct}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </MemberCard>

        {/* Login Activity — 2/3 */}
        <div className="lg:col-span-2">
          <MemberCard title="Login Activity" viewAllHref="/member/sessions" viewAllLabel="Last 7 days">
            <div className="h-36">
              {mounted ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={LOGIN_CHART} margin={{ top: 4, right: 16, bottom: 0, left: -28 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                    <XAxis dataKey="day" tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} />
                    <YAxis tick={{ fontSize: 10, fill: "#94a3b8" }} axisLine={false} tickLine={false} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ fontSize: 12, borderRadius: 8, border: "1px solid #e2e8f0", boxShadow: "0 1px 4px rgba(0,0,0,.08)" }}
                      labelStyle={{ fontWeight: 600, color: "#334155" }}
                    />
                    <Line
                      type="monotone" dataKey="logins" stroke="#6366f1" strokeWidth={2.5}
                      dot={{ fill: "#6366f1", r: 3, strokeWidth: 0 }}
                      activeDot={{ r: 5, fill: "#4f46e5" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-36 animate-pulse rounded-xl bg-slate-100" />
              )}
            </div>
          </MemberCard>
        </div>
      </div>

      {/* Footer */}
      <footer className="flex flex-wrap items-center justify-between gap-2 border-t border-slate-200 pt-4 text-[11px] text-slate-400">
        <span>© 2026 NutraTenant. All rights reserved.</span>
        <div className="flex gap-4">
          {["Support", "Status", "Privacy", "Terms"].map((l) => (
            <a key={l} href="#" className="hover:text-slate-600 hover:underline">{l}</a>
          ))}
        </div>
      </footer>
    </div>
  );
}
