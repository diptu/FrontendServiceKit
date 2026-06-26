"use client";

import { useParams } from "next/navigation";
import PreviewBanner from "@/components/platform-admin/ui/PreviewBanner";
import { MonitorSmartphone, Laptop, Smartphone, Globe } from "lucide-react";
import { usePreviewUser } from "@/components/org/PreviewUserContext";

const ALL_SESSIONS = [
  { id: "s1",  user: "Sarah Mitchell",  email: "sarah.m@nutracorp.test",   device: "MacBook Pro",     browser: "Chrome 125",  ip: "192.168.1.10", location: "New York, US",     started: "10 min ago",  expires: "7 hr 50 min",  type: "desktop" },
  { id: "s2",  user: "James Chen",      email: "james.c@nutracorp.test",   device: "Windows PC",      browser: "Edge 124",    ip: "10.0.0.42",    location: "San Francisco, US", started: "32 min ago",  expires: "7 hr 28 min",  type: "desktop" },
  { id: "s3",  user: "Priya Patel",     email: "priya.p@nutracorp.test",   device: "iPhone 15",       browser: "Safari 17",   ip: "172.16.0.5",   location: "Austin, US",        started: "1 hr ago",    expires: "6 hr 59 min",  type: "mobile"  },
  { id: "s4",  user: "Alice Wright",    email: "alice.w@nutracorp.test",   device: "MacBook Air",     browser: "Firefox 126", ip: "192.168.2.20", location: "Chicago, US",       started: "2 hr ago",    expires: "5 hr 58 min",  type: "desktop" },
  { id: "s5",  user: "Bob Keller",      email: "bob.k@nutracorp.test",     device: "Android Phone",   browser: "Chrome 125",  ip: "10.0.1.15",    location: "Miami, US",         started: "3 hr ago",    expires: "4 hr 59 min",  type: "mobile"  },
  { id: "s6",  user: "Charlie Nguyen",  email: "charlie.n@nutracorp.test", device: "iPad Pro",        browser: "Safari 17",   ip: "172.31.0.8",   location: "Seattle, US",       started: "4 hr ago",    expires: "3 hr 58 min",  type: "mobile"  },
  { id: "s7",  user: "Dana Osei",       email: "dana.o@nutracorp.test",    device: "Linux Desktop",   browser: "Firefox 126", ip: "192.168.3.5",  location: "Boston, US",        started: "5 hr ago",    expires: "2 hr 57 min",  type: "desktop" },
  { id: "s8",  user: "Evan Marsh",      email: "evan.m@nutracorp.test",    device: "Windows Laptop",  browser: "Chrome 125",  ip: "10.0.2.30",    location: "Denver, US",        started: "6 hr ago",    expires: "1 hr 56 min",  type: "desktop" },
];

// Member only sees their own session
const MY_SESSIONS = ALL_SESSIONS.filter(s => s.id === "s3");

const DeviceIcon = ({ type }: { type: string }) =>
  type === "mobile"
    ? <Smartphone className="h-4 w-4 text-slate-400" />
    : <Laptop className="h-4 w-4 text-slate-400" />;

export default function SessionsPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { currentUser } = usePreviewUser();
  const isMember = currentUser.role === "member";
  const sessions = isMember ? MY_SESSIONS : ALL_SESSIONS;
  const display = orgSlug.split("-").map((w: string) => w[0].toUpperCase() + w.slice(1)).join(" ");

  return (
    <div className="flex flex-col gap-6">
      <PreviewBanner showIcon>Preview mode — session revocation is disabled until role gates are enforced.</PreviewBanner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <MonitorSmartphone className="h-5 w-5 text-indigo-500" />
            {isMember ? "My Sessions" : "Active Sessions"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isMember ? "Your current active sessions in" : `${sessions.length} active sessions across`}{" "}
            <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        {!isMember && (
          <button type="button" className="rounded-lg border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 transition-colors">
            Revoke All Sessions
          </button>
        )}
      </div>

      {/* Summary cards — admin/owner only */}
      {!isMember && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          {[
            { label: "Total Sessions", value: sessions.length, icon: MonitorSmartphone, color: "text-indigo-500" },
            { label: "Desktop",        value: sessions.filter(s => s.type === "desktop").length, icon: Laptop,      color: "text-sky-500"    },
            { label: "Mobile",         value: sessions.filter(s => s.type === "mobile").length,  icon: Smartphone,  color: "text-violet-500" },
            { label: "Locations",      value: new Set(sessions.map(s => s.location.split(",")[1]?.trim())).size, icon: Globe, color: "text-emerald-500" },
          ].map(card => {
            const Icon = card.icon;
            return (
              <div key={card.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium text-slate-500">{card.label}</p>
                  <Icon className={`h-4 w-4 ${card.color}`} strokeWidth={1.75} />
                </div>
                <p className="mt-2 text-2xl font-bold text-slate-900">{card.value}</p>
              </div>
            );
          })}
        </div>
      )}

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-100 bg-slate-50">
            <tr>
              {!isMember && <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">User</th>}
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Device</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">IP / Location</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Started</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500">Expires in</th>
              <th className="px-5 py-3.5 text-xs font-semibold text-slate-500" />
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {sessions.map(s => (
              <tr key={s.id} className="hover:bg-slate-50/60 transition-colors">
                {!isMember && (
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-indigo-100 text-xs font-semibold text-indigo-700">
                        {s.user.split(" ").map(n => n[0]).join("").slice(0, 2)}
                      </div>
                      <div>
                        <p className="text-xs font-medium text-slate-900">{s.user}</p>
                        <p className="text-[11px] text-slate-400">{s.email}</p>
                      </div>
                    </div>
                  </td>
                )}
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-2">
                    <DeviceIcon type={s.type} />
                    <div>
                      <p className="text-xs font-medium text-slate-800">{s.device}</p>
                      <p className="text-[11px] text-slate-400">{s.browser}</p>
                    </div>
                  </div>
                </td>
                <td className="px-5 py-3.5">
                  <p className="font-mono text-xs text-slate-700">{s.ip}</p>
                  <p className="text-[11px] text-slate-400">{s.location}</p>
                </td>
                <td className="px-5 py-3.5 text-xs text-slate-500">{s.started}</td>
                <td className="px-5 py-3.5 text-xs font-medium text-slate-700">{s.expires}</td>
                <td className="px-5 py-3.5 text-right">
                  <button type="button" className="rounded-lg border border-red-100 px-3 py-1.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors">
                    Revoke
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        <div className="border-t border-slate-100 px-5 py-3">
          <p className="text-xs text-slate-500">{sessions.length} session{sessions.length !== 1 ? "s" : ""} shown</p>
        </div>
      </div>
    </div>
  );
}
