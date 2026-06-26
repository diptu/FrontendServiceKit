"use client";

import { useParams } from "next/navigation";
import { MonitorSmartphone, Laptop, Smartphone, Globe } from "lucide-react";
import { usePreviewUser } from "@/components/org/PreviewUserContext";
import {
  Banner, Button, Avatar, StatCard,
  StatusBadge,
  DataTable, TableToolbar,
  type Column,
} from "@/components/ui";

const ALL_SESSIONS = [
  { id: "s1", user: "Sarah Mitchell",  email: "sarah.m@nutracorp.test",   device: "MacBook Pro",    browser: "Chrome 125",  ip: "192.168.1.10", location: "New York, US",      started: "10 min ago", expires: "7 hr 50 min", type: "desktop" },
  { id: "s2", user: "James Chen",      email: "james.c@nutracorp.test",   device: "Windows PC",     browser: "Edge 124",    ip: "10.0.0.42",    location: "San Francisco, US", started: "32 min ago", expires: "7 hr 28 min", type: "desktop" },
  { id: "s3", user: "Priya Patel",     email: "priya.p@nutracorp.test",   device: "iPhone 15",      browser: "Safari 17",   ip: "172.16.0.5",   location: "Austin, US",        started: "1 hr ago",   expires: "6 hr 59 min", type: "mobile"  },
  { id: "s4", user: "Alice Wright",    email: "alice.w@nutracorp.test",   device: "MacBook Air",    browser: "Firefox 126", ip: "192.168.2.20", location: "Chicago, US",       started: "2 hr ago",   expires: "5 hr 58 min", type: "desktop" },
  { id: "s5", user: "Bob Keller",      email: "bob.k@nutracorp.test",     device: "Android Phone",  browser: "Chrome 125",  ip: "10.0.1.15",    location: "Miami, US",         started: "3 hr ago",   expires: "4 hr 59 min", type: "mobile"  },
  { id: "s6", user: "Charlie Nguyen",  email: "charlie.n@nutracorp.test", device: "iPad Pro",       browser: "Safari 17",   ip: "172.31.0.8",   location: "Seattle, US",       started: "4 hr ago",   expires: "3 hr 58 min", type: "mobile"  },
  { id: "s7", user: "Dana Osei",       email: "dana.o@nutracorp.test",    device: "Linux Desktop",  browser: "Firefox 126", ip: "192.168.3.5",  location: "Boston, US",        started: "5 hr ago",   expires: "2 hr 57 min", type: "desktop" },
  { id: "s8", user: "Evan Marsh",      email: "evan.m@nutracorp.test",    device: "Windows Laptop", browser: "Chrome 125",  ip: "10.0.2.30",    location: "Denver, US",        started: "6 hr ago",   expires: "1 hr 56 min", type: "desktop" },
];

type Session = typeof ALL_SESSIONS[0];

const MY_SESSIONS = ALL_SESSIONS.filter(s => s.id === "s3");

function DeviceCell({ s }: { s: Session }) {
  const Icon = s.type === "mobile" ? Smartphone : Laptop;
  return (
    <div className="flex items-center gap-2">
      <Icon className="h-4 w-4 text-slate-400 shrink-0" />
      <div>
        <p className="text-xs font-medium text-slate-800">{s.device}</p>
        <p className="text-[11px] text-slate-400">{s.browser}</p>
      </div>
    </div>
  );
}

export default function SessionsPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { currentUser } = usePreviewUser();
  const isMember = currentUser.role === "member";
  const sessions = isMember ? MY_SESSIONS : ALL_SESSIONS;
  const display  = orgSlug.split("-").map((w: string) => w[0].toUpperCase() + w.slice(1)).join(" ");

  const COLUMNS: Column<Session>[] = [
    ...(!isMember ? [{
      key: "user", header: "User",
      render: (s: Session) => (
        <div className="flex items-center gap-2.5">
          <Avatar name={s.user} size="sm" />
          <div>
            <p className="text-xs font-medium text-slate-900">{s.user}</p>
            <p className="text-[11px] text-slate-400">{s.email}</p>
          </div>
        </div>
      ),
    }] : []),
    { key: "device",  header: "Device",      render: s => <DeviceCell s={s} /> },
    {
      key: "ip", header: "IP / Location",
      render: s => (
        <>
          <p className="font-mono text-xs text-slate-700">{s.ip}</p>
          <p className="text-[11px] text-slate-400">{s.location}</p>
        </>
      ),
    },
    { key: "started", header: "Started",     className: "text-xs text-slate-500" },
    { key: "expires", header: "Expires in",  render: s => <span className="text-xs font-medium text-slate-700">{s.expires}</span> },
    {
      key: "actions", header: "", align: "right" as const,
      render: () => (
        <Button variant="danger" size="xs">Revoke</Button>
      ),
    },
  ];

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — session revocation is disabled until role gates are enforced.
      </Banner>

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
          <Button variant="danger" size="sm">Revoke All Sessions</Button>
        )}
      </div>

      {!isMember && (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <StatCard icon={MonitorSmartphone} label="Total Sessions" value={sessions.length} color="indigo" />
          <StatCard icon={Laptop}            label="Desktop"        value={sessions.filter(s => s.type === "desktop").length} color="sky"    />
          <StatCard icon={Smartphone}        label="Mobile"         value={sessions.filter(s => s.type === "mobile").length}  color="violet" />
          <StatCard icon={Globe}             label="Locations"
            value={new Set(sessions.map(s => s.location.split(",")[1]?.trim())).size}
            color="emerald"
          />
        </div>
      )}

      <TableToolbar
        right={<StatusBadge status="active" dot />}
      />

      <DataTable<Session>
        columns={COLUMNS}
        data={sessions}
        rowKey={s => s.id}
        emptyTitle="No active sessions"
      />
    </div>
  );
}
