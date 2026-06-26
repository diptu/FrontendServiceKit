"use client";

import { useParams } from "next/navigation";
import { AppWindow, Plus } from "lucide-react";
import { usePreviewUser } from "@/components/org/PreviewUserContext";
import {
  Banner, Button,
  Card, CardHeader, CardBody, CardFooter,
  StatusBadge, Badge,
  SearchBox, EmptyState,
  ProgressBar,
} from "@/components/ui";
import { useState } from "react";

const ALL_APPS = [
  { id: "a1", name: "NutraCRM",     type: "SaaS",       users: 445, sessions: 67,  adoptionPct: 45, lastActivity: "2 min ago",  status: "active"   },
  { id: "a2", name: "SecurePass",   type: "Tool",       users: 398, sessions: 89,  adoptionPct: 32, lastActivity: "10 min ago", status: "active"   },
  { id: "a3", name: "WorkflowPro",  type: "Automation", users: 209, sessions: 34,  adoptionPct: 17, lastActivity: "1 hr ago",   status: "active"   },
  { id: "a4", name: "MediaManager", type: "Content",    users: 134, sessions: 22,  adoptionPct: 11, lastActivity: "3 hr ago",   status: "active"   },
  { id: "a5", name: "DataVault",    type: "Storage",    users: 62,  sessions: 8,   adoptionPct: 5,  lastActivity: "2 days ago", status: "inactive" },
  { id: "a6", name: "AnalyticsHub", type: "Analytics",  users: 89,  sessions: 14,  adoptionPct: 7,  lastActivity: "5 hr ago",   status: "active"   },
];

const MY_APPS = ALL_APPS.filter(a => ["a1", "a3", "a4"].includes(a.id));

export default function ApplicationsPage() {
  const { orgSlug } = useParams<{ orgSlug: string }>();
  const { currentUser } = usePreviewUser();
  const isMember = currentUser.role === "member";
  const allApps  = isMember ? MY_APPS : ALL_APPS;
  const display  = orgSlug.split("-").map((w: string) => w[0].toUpperCase() + w.slice(1)).join(" ");

  const [search, setSearch] = useState("");
  const filtered = allApps.filter(a =>
    !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.type.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="flex flex-col gap-6">
      <Banner variant="info" showIcon>
        Preview mode — application management is read-only until role gates are enforced.
      </Banner>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="flex items-center gap-2 text-xl font-bold tracking-tight text-slate-900">
            <AppWindow className="h-5 w-5 text-indigo-500" />
            {isMember ? "My Applications" : "Applications"}
          </h1>
          <p className="mt-1 text-sm text-slate-500">
            {isMember ? "Apps assigned to your account in" : "All registered applications in"}{" "}
            <span className="font-medium text-slate-700">{display}</span>
          </p>
        </div>
        {!isMember && <Button icon={Plus}>Add Application</Button>}
      </div>

      <SearchBox value={search} onChange={setSearch} placeholder="Search applications…" />

      {filtered.length === 0 ? (
        <EmptyState icon={AppWindow} title="No applications found" description="Try adjusting your search." compact />
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(app => (
            <Card key={app.id} className="hover:shadow-md transition-shadow">
              <CardHeader
                title={app.name}
                description={app.type}
                icon={
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-indigo-100 text-lg font-bold text-indigo-700">
                    {app.name[0]}
                  </div>
                }
                action={<StatusBadge status={app.status} dot />}
              />
              <CardBody>
                <div className="grid grid-cols-2 gap-3 text-xs">
                  {!isMember && (
                    <div className="rounded-lg bg-slate-50 p-2.5">
                      <p className="text-slate-400">Users</p>
                      <p className="mt-0.5 font-semibold text-slate-900">{app.users.toLocaleString()}</p>
                    </div>
                  )}
                  <div className="rounded-lg bg-slate-50 p-2.5">
                    <p className="text-slate-400">Sessions</p>
                    <p className="mt-0.5 font-semibold text-slate-900">{app.sessions}</p>
                  </div>
                  <div className={`rounded-lg bg-slate-50 p-2.5 ${isMember ? "col-span-2" : ""}`}>
                    <p className="text-slate-400">Last activity</p>
                    <p className="mt-0.5 font-semibold text-slate-900">{app.lastActivity}</p>
                  </div>
                </div>
                <div className="mt-3">
                  <ProgressBar value={app.adoptionPct} label="Adoption" showValue size="xs" color="indigo" />
                </div>
              </CardBody>
              <CardFooter>
                <Button variant="outline" size="sm" fullWidth>
                  {isMember ? "Open App" : "Manage"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
