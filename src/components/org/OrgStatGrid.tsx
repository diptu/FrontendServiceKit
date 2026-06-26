"use client";

import { useEffect, useState } from "react";
import { AppWindow, MonitorSmartphone, ShieldCheck, TrendingUp, Users, UsersRound, type LucideIcon } from "lucide-react";
import { usePreviewUser, type PreviewRole } from "./PreviewUserContext";
import { StaggerContainer, StaggerItem } from "@/components/ui";

interface OrgStat {
  id: string;
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  subtext?: string;
  icon: LucideIcon;
  iconColor: string;
}

const STATS_BY_ROLE: Record<PreviewRole, OrgStat[]> = {
  owner: [
    { id: "users",    label: "Users",           value: "1,248", delta: "+4.6%",  deltaPositive: true,  subtext: "past month", icon: Users,            iconColor: "text-indigo-500"  },
    { id: "groups",   label: "Groups",          value: "156",   delta: "+12.4%", deltaPositive: true,  subtext: "new groups", icon: UsersRound,       iconColor: "text-violet-500"  },
    { id: "apps",     label: "Applications",    value: "28",    delta: "+1%",    deltaPositive: true,  subtext: "4 apps",    icon: AppWindow,        iconColor: "text-sky-500"     },
    { id: "roles",    label: "Roles",           value: "64",    subtext: "no change",                                        icon: ShieldCheck,      iconColor: "text-amber-500"   },
    { id: "sessions", label: "Active Sessions", value: "89",    delta: "+4.7%",  deltaPositive: true,  subtext: "active now", icon: MonitorSmartphone,iconColor: "text-emerald-500" },
  ],
  admin: [
    { id: "users",    label: "Users",           value: "1,248", delta: "+4.6%",  deltaPositive: true,  subtext: "past month", icon: Users,            iconColor: "text-indigo-500"  },
    { id: "groups",   label: "Groups",          value: "156",   delta: "+12.4%", deltaPositive: true,  subtext: "new groups", icon: UsersRound,       iconColor: "text-violet-500"  },
    { id: "apps",     label: "Applications",    value: "28",    delta: "+1%",    deltaPositive: true,  subtext: "4 apps",    icon: AppWindow,        iconColor: "text-sky-500"     },
    { id: "roles",    label: "Roles",           value: "64",    subtext: "no change",                                        icon: ShieldCheck,      iconColor: "text-amber-500"   },
    { id: "sessions", label: "Active Sessions", value: "89",    delta: "+4.7%",  deltaPositive: true,  subtext: "active now", icon: MonitorSmartphone,iconColor: "text-emerald-500" },
  ],
  moderator: [
    { id: "users",    label: "Users",           value: "1,248", delta: "+4.6%",  deltaPositive: true,  subtext: "past month", icon: Users,            iconColor: "text-indigo-500"  },
    { id: "groups",   label: "Groups",          value: "156",   delta: "+12.4%", deltaPositive: true,  subtext: "new groups", icon: UsersRound,       iconColor: "text-violet-500"  },
    { id: "apps",     label: "Applications",    value: "28",    delta: "+1%",    deltaPositive: true,  subtext: "4 apps",    icon: AppWindow,        iconColor: "text-sky-500"     },
    { id: "roles",    label: "Roles",           value: "64",    subtext: "no change",                                        icon: ShieldCheck,      iconColor: "text-amber-500"   },
    { id: "sessions", label: "Active Sessions", value: "89",    delta: "+4.7%",  deltaPositive: true,  subtext: "active now", icon: MonitorSmartphone,iconColor: "text-emerald-500" },
  ],
  member: [
    { id: "users",    label: "Visible Users",   value: "468",   delta: "+2.1%",  deltaPositive: true,  subtext: "in scope",   icon: Users,            iconColor: "text-indigo-500"  },
    { id: "groups",   label: "My Groups",       value: "32",    subtext: "joined",                                            icon: UsersRound,       iconColor: "text-violet-500"  },
    { id: "apps",     label: "My Applications", value: "6",     subtext: "assigned",                                          icon: AppWindow,        iconColor: "text-sky-500"     },
    { id: "roles",    label: "Roles",           value: "18",    subtext: "available",                                         icon: ShieldCheck,      iconColor: "text-amber-500"   },
    { id: "sessions", label: "Active Sessions", value: "89",    delta: "+4.7%",  deltaPositive: true,  subtext: "active now", icon: MonitorSmartphone,iconColor: "text-emerald-500" },
  ],
};

function StatCardSkeleton() {
  return (
    <div className="animate-pulse rounded-xl border border-slate-200 bg-white p-5">
      <div className="h-3 w-24 rounded bg-slate-200" />
      <div className="mt-3 h-8 w-20 rounded bg-slate-200" />
      <div className="mt-2 h-3 w-16 rounded bg-slate-100" />
    </div>
  );
}

export default function OrgStatGrid() {
  const { currentUser } = usePreviewUser();
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
    const t = setTimeout(() => setLoaded(true), 600);
    return () => clearTimeout(t);
  }, [currentUser.role]);

  const stats = STATS_BY_ROLE[currentUser.role];

  if (!loaded) {
    return (
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {Array.from({ length: 5 }).map((_, i) => <StatCardSkeleton key={i} />)}
      </div>
    );
  }

  return (
    <StaggerContainer stagger={0.09} delayChildren={0.05} className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
      {stats.map((stat) => {
        const Icon = stat.icon;
        return (
          <StaggerItem key={stat.id}>
            <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm transition-shadow hover:shadow-md">
              <div className="flex items-center justify-between">
                <p className="text-xs font-medium text-slate-500">{stat.label}</p>
                <Icon className={`h-4 w-4 ${stat.iconColor}`} strokeWidth={1.75} />
              </div>
              <p className="mt-3 text-2xl font-bold tracking-tight text-slate-900">{stat.value}</p>
              <div className="mt-1 flex items-center gap-1.5">
                {stat.delta && (
                  <span className={`flex items-center gap-0.5 text-xs font-semibold ${stat.deltaPositive ? "text-emerald-600" : "text-red-500"}`}>
                    <TrendingUp className="h-3 w-3" strokeWidth={2} />
                    {stat.delta}
                  </span>
                )}
                {stat.subtext && <span className="text-xs text-slate-400">{stat.subtext}</span>}
              </div>
            </div>
          </StaggerItem>
        );
      })}
    </StaggerContainer>
  );
}
