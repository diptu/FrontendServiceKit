"use client";

import { useState } from "react";
import { Laptop2, MonitorSmartphone, Smartphone, Tablet, X } from "lucide-react";
import { MemberCard, MemberStatCard } from "@/components/member/ui";

const SESSIONS = [
  { id:"s1", device:"MacBook Pro 14\"",   browser:"Chrome 125",  os:"macOS 14.4",    ip:"192.168.1.10", location:"New York, US 🇺🇸",   lastActive:"Just now",    current:true,  type:"desktop" as const },
  { id:"s2", device:"iPhone 15 Pro",     browser:"Safari 17.4", os:"iOS 17.4",       ip:"192.168.1.11", location:"New York, US 🇺🇸",   lastActive:"5 min ago",   current:false, type:"mobile"  as const },
  { id:"s3", device:"Windows 11 PC",     browser:"Edge 124",    os:"Windows 11",     ip:"10.0.0.45",    location:"Chicago, US 🇺🇸",    lastActive:"Jun 22 18:00", current:false, type:"desktop" as const },
  { id:"s4", device:"iPad Air",          browser:"Safari 17",   os:"iPadOS 17.2",    ip:"172.16.0.8",   location:"Boston, US 🇺🇸",     lastActive:"Jun 20 10:15", current:false, type:"tablet"  as const },
];

type Session = (typeof SESSIONS)[number];

const DEVICE_ICON: Record<string, React.ElementType> = {
  desktop: Laptop2,
  mobile:  Smartphone,
  tablet:  Tablet,
};

export default function MemberSessionsPage() {
  const [sessions, setSessions] = useState<Session[]>(SESSIONS);
  const [selected, setSelected] = useState<Session | null>(null);

  function revoke(id: string) {
    setSessions((prev) => prev.filter((s) => s.id !== id));
    if (selected?.id === id) setSelected(null);
  }

  function revokeAll() {
    setSessions((prev) => prev.filter((s) => s.current));
    setSelected(null);
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="rounded-lg border border-amber-200 bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-800">
        Preview mode — My Sessions. Auth gate disabled for local dev.
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold tracking-tight text-slate-900">Active Sessions</h1>
          <p className="mt-0.5 text-sm text-slate-500">Devices currently signed in to your account.</p>
        </div>
        <button type="button" onClick={revokeAll}
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-xs font-semibold text-red-600 hover:bg-red-100">
          Revoke All Other Sessions
        </button>
      </div>

      <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        <MemberStatCard icon={MonitorSmartphone} value={sessions.length} label="Active Sessions"  sub="Across all devices" />
        <MemberStatCard icon={Laptop2}           value={sessions.filter(s => s.type === "desktop").length} label="Desktop"    sub="Laptop / PC" iconBg="bg-violet-50" iconColor="text-violet-600" />
        <MemberStatCard icon={Smartphone}        value={sessions.filter(s => s.type === "mobile").length}  label="Mobile"     sub="Phone devices" iconBg="bg-emerald-50" iconColor="text-emerald-600" />
        <MemberStatCard icon={Tablet}            value={sessions.filter(s => s.type === "tablet").length}  label="Tablet"     sub="Tablet devices" iconBg="bg-amber-50" iconColor="text-amber-600" />
      </div>

      <div className="flex gap-4 items-start">
        <div className="flex-1 min-w-0">
          <MemberCard title={`${sessions.length} Session${sessions.length !== 1 ? "s" : ""}`}>
            <div className="flex flex-col gap-3">
              {sessions.length === 0 && (
                <p className="py-8 text-center text-sm text-slate-400">No other sessions active.</p>
              )}
              {sessions.map((s) => {
                const Icon = DEVICE_ICON[s.type];
                return (
                  <div key={s.id} onClick={() => setSelected((p) => p?.id === s.id ? null : s)}
                    className={`flex cursor-pointer items-center gap-4 rounded-xl border p-4 transition-colors hover:border-indigo-200 hover:bg-indigo-50/50 ${selected?.id === s.id ? "border-indigo-300 bg-indigo-50/60" : "border-slate-200"} ${s.current ? "ring-1 ring-indigo-300" : ""}`}>
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100">
                      <Icon className="h-5 w-5 text-slate-600" strokeWidth={1.8} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-semibold text-slate-900 text-sm">{s.device}</p>
                        {s.current && <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-[10px] font-semibold text-emerald-700">Current</span>}
                      </div>
                      <p className="text-[11px] text-slate-500">{s.browser} · {s.os}</p>
                      <p className="text-[11px] text-slate-400">{s.location} · {s.ip}</p>
                    </div>
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-[11px] text-slate-400">{s.lastActive}</span>
                      {!s.current && (
                        <button type="button" onClick={(e) => { e.stopPropagation(); revoke(s.id); }}
                          className="rounded-md border border-red-200 bg-red-50 px-3 py-1 text-[11px] font-semibold text-red-600 hover:bg-red-100">
                          Revoke
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </MemberCard>
        </div>

        {/* Detail panel */}
        {selected && (
          <div className="w-72 shrink-0 rounded-xl border border-slate-200 bg-white shadow-sm">
            <div className="flex items-center justify-between border-b border-slate-100 px-4 py-3.5">
              <span className="text-sm font-semibold text-slate-900">Session Detail</span>
              <button type="button" onClick={() => setSelected(null)} className="rounded p-1 hover:bg-slate-100">
                <X className="h-4 w-4 text-slate-400" />
              </button>
            </div>
            <div className="p-4 flex flex-col gap-3">
              {[
                ["Device",    selected.device],
                ["Browser",   selected.browser],
                ["OS",        selected.os],
                ["IP Address",selected.ip],
                ["Location",  selected.location],
                ["Last Active", selected.lastActive],
                ["Status",    selected.current ? "Current session" : "Remote"],
              ].map(([l, v]) => (
                <div key={l} className="flex justify-between">
                  <span className="text-[11px] text-slate-400">{l}</span>
                  <span className="text-[11px] font-semibold text-slate-700">{v}</span>
                </div>
              ))}
              {!selected.current && (
                <button type="button" onClick={() => revoke(selected.id)}
                  className="mt-2 w-full rounded-lg bg-red-600 py-2 text-xs font-semibold text-white hover:bg-red-700">
                  Revoke This Session
                </button>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Security tip */}
      <div className="rounded-xl border border-indigo-100 bg-indigo-50 p-4">
        <p className="text-xs font-semibold text-indigo-800">Security Tip</p>
        <p className="mt-1 text-xs text-indigo-600">
          If you see an unfamiliar session, revoke it immediately and change your password. Consider enabling MFA if not already active.
        </p>
      </div>
    </div>
  );
}
