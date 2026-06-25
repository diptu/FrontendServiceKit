"use client";

import { useState } from "react";
import PlatformAdminShell from "@/components/platform-admin/PlatformAdminShell";
import {
  AdminFooter,
  DetailPanel,
  DetailRow,
  PageHeader,
  PreviewBanner,
  SearchFilterBar,
  StatCard,
  StatGrid,
  StatusBadge,
  TabBar,
} from "@/components/platform-admin/ui";
import { type LucideIcon, Calendar, CheckCircle2, Clock, FileText, GitBranch, Globe, Loader2, Plus, Search, Tag, User, XCircle } from "lucide-react";

type ProvStatus = "In Progress" | "In Review" | "Completed" | "Failed";

interface ProvRequest {
  id: string; tenantName: string; slug: string; requestedBy: string;
  plan: "Enterprise" | "Growth" | "Starter"; status: ProvStatus;
  submittedAt: string; updatedAt: string; adminEmail: string; domain: string; description: string;
}

const MOCK_REQUESTS: ProvRequest[] = [
  { id:"PR-001", tenantName:"Green Valley LLC",    slug:"greenvalley",    requestedBy:"John Doe",     plan:"Enterprise", status:"In Progress", submittedAt:"Jun 10, 2026", updatedAt:"Jun 20, 2026", adminEmail:"john.doe@greenvalley.test",    domain:"greenvalley.nutratenant.com",    description:"Health supplement brand managing nutrition compliance."       },
  { id:"PR-008", tenantName:"VitalTrack Inc.",     slug:"vitaltrack",     requestedBy:"Dan Brown",    plan:"Growth",     status:"In Progress", submittedAt:"Jun 18, 2026", updatedAt:"Jun 24, 2026", adminEmail:"dan@vitaltrack.test",           domain:"vitaltrack.nutratenant.com",     description:"Real-time vitality and activity tracking platform."           },
  { id:"PR-002", tenantName:"Blue Health Systems", slug:"bluehealth",     requestedBy:"Sarah White",  plan:"Growth",     status:"In Review",   submittedAt:"Jun 8, 2026",  updatedAt:"Jun 19, 2026", adminEmail:"sarah@bluehealth.test",         domain:"bluehealth.nutratenant.com",     description:"Integrated healthcare management and patient portal."         },
  { id:"PR-007", tenantName:"NutriFlex Co.",       slug:"nutriflex",      requestedBy:"Lisa Kim",     plan:"Enterprise", status:"In Review",   submittedAt:"Jun 15, 2026", updatedAt:"Jun 22, 2026", adminEmail:"lisa@nutriflex.test",           domain:"nutriflex.nutratenant.com",      description:"AI-powered personalised nutrition and supplement tracking."   },
  { id:"PR-009", tenantName:"PureForm Studios",    slug:"pureform",       requestedBy:"Amy Chen",     plan:"Starter",    status:"In Review",   submittedAt:"Jun 5, 2026",  updatedAt:"Jun 12, 2026", adminEmail:"amy@pureform.test",             domain:"pureform.nutratenant.com",       description:"Boutique fitness studio management and scheduling."           },
  { id:"PR-003", tenantName:"Bright Paleo Labs",   slug:"brightpaleo",    requestedBy:"Mike Jones",   plan:"Starter",    status:"Completed",   submittedAt:"May 28, 2026", updatedAt:"Jun 5, 2026",  adminEmail:"mike@brightpaleo.test",         domain:"brightpaleo.nutratenant.com",    description:"Paleo diet research and product formulation lab."             },
  { id:"PR-004", tenantName:"Apple Corp",          slug:"applecorp",      requestedBy:"System Admin", plan:"Enterprise", status:"Completed",   submittedAt:"Jan 12, 2024", updatedAt:"Jan 15, 2024", adminEmail:"admin@applecorp.test",          domain:"applecorp.nutratenant.com",      description:"Apple Corp primary IAM workspace setup."                     },
  { id:"PR-005", tenantName:"Banana Republic",     slug:"bananarepublic", requestedBy:"System Admin", plan:"Starter",    status:"Completed",   submittedAt:"Jun 7, 2024",  updatedAt:"Jun 10, 2024", adminEmail:"admin@bananarepublic.test",     domain:"bananarepublic.nutratenant.com", description:"Banana Republic tenant provisioning and onboarding."         },
  { id:"PR-006", tenantName:"Orange Teck",         slug:"orangeteck",     requestedBy:"System Admin", plan:"Growth",     status:"Completed",   submittedAt:"Mar 20, 2024", updatedAt:"Mar 22, 2024", adminEmail:"admin@orangeteck.test",         domain:"orangeteck.nutratenant.com",     description:"Orange Teck platform setup and initial configuration."       },
  { id:"PR-010", tenantName:"MetaVit Corp",        slug:"metavit",        requestedBy:"Sam Lee",      plan:"Enterprise", status:"Completed",   submittedAt:"May 1, 2026",  updatedAt:"May 10, 2026", adminEmail:"sam@metavit.test",              domain:"metavit.nutratenant.com",        description:"AI-assisted vitamin and micronutrient tracking SaaS."        },
  { id:"PR-011", tenantName:"HealPath LLC",        slug:"healpath",       requestedBy:"Rachel Green", plan:"Growth",     status:"Completed",   submittedAt:"Apr 15, 2026", updatedAt:"Apr 20, 2026", adminEmail:"rachel@healpath.test",          domain:"healpath.nutratenant.com",       description:"Holistic healing pathway management and coaching."            },
  { id:"PR-012", tenantName:"FlexNutrition",       slug:"flexnutrition",  requestedBy:"Tom Wilson",   plan:"Growth",     status:"Completed",   submittedAt:"Mar 10, 2026", updatedAt:"Mar 18, 2026", adminEmail:"tom@flexnutrition.test",        domain:"flexnutrition.nutratenant.com",  description:"Flexible nutrition tracking and meal planning platform."      },
];

const STATUS_META: Record<ProvStatus, { badge: string; icon: LucideIcon }> = {
  "In Progress": { badge:"bg-amber-50 text-amber-700 ring-1 ring-amber-200",     icon:Loader2     },
  "In Review":   { badge:"bg-blue-50 text-blue-700 ring-1 ring-blue-200",        icon:Clock       },
  "Completed":   { badge:"bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200",icon:CheckCircle2},
  "Failed":      { badge:"bg-red-50 text-red-700 ring-1 ring-red-200",           icon:XCircle     },
};

const PLAN_BADGE: Record<string, string> = { Enterprise:"bg-violet-50 text-violet-700", Growth:"bg-blue-50 text-blue-700", Starter:"bg-gray-100 text-gray-600" };

const TABS = ["All","In Progress","In Review","Completed","Failed"] as const;
type Tab = typeof TABS[number];

export default function TenantProvisioningPage() {
  const [activeTab, setActiveTab] = useState<Tab>("All");
  const [selected, setSelected]   = useState<ProvRequest | null>(null);
  const [search, setSearch]       = useState("");

  const counts = Object.fromEntries(TABS.map((t) => [t, t === "All" ? MOCK_REQUESTS.length : MOCK_REQUESTS.filter((r) => r.status === t).length])) as Record<Tab, number>;

  const filtered = MOCK_REQUESTS.filter((r) => {
    const matchTab    = activeTab === "All" || r.status === activeTab;
    const matchSearch = !search || r.tenantName.toLowerCase().includes(search.toLowerCase()) || r.requestedBy.toLowerCase().includes(search.toLowerCase());
    return matchTab && matchSearch;
  });

  const statDefs: { label: string; icon: LucideIcon; bg: string; color: string }[] = [
    { label:"All Requests", icon:GitBranch,   bg:"bg-slate-100",  color:"text-slate-600"   },
    { label:"In Progress",  icon:Loader2,     bg:"bg-amber-50",   color:"text-amber-600"   },
    { label:"In Review",    icon:Clock,       bg:"bg-blue-50",    color:"text-blue-600"    },
    { label:"Completed",    icon:CheckCircle2,bg:"bg-emerald-50", color:"text-emerald-600" },
    { label:"Failed",       icon:XCircle,     bg:"bg-red-50",     color:"text-red-600"     },
  ];

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId="preview">
      <div className="flex flex-col gap-6">
        <PreviewBanner>Preview mode — Tenant Provisioning. Auth gate disabled for local dev.</PreviewBanner>

        <PageHeader
          title="Tenant Provisioning"
          subtitle="Manage the flow of tenant onboarding and provisioning."
          actions={
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
              <Plus className="h-4 w-4" /> Provision New Tenant
            </button>
          }
        />

        <StatGrid cols={5}>
          {statDefs.map((s) => <StatCard key={s.label} icon={s.icon} value={counts[s.label as Tab] ?? MOCK_REQUESTS.filter((r) => r.status === s.label).length} label={s.label} bg={s.bg} color={s.color} />)}
        </StatGrid>

        <div className="flex gap-6">
          {/* Table panel */}
          <div className={`flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all ${selected ? "flex-1" : "w-full"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-4">
              <TabBar
                tabs={TABS.map((t) => ({ label: t, count: counts[t] }))}
                active={activeTab}
                onChange={(l) => setActiveTab(l as Tab)}
                variant="underline"
              />
              <SearchFilterBar
                searchSlot={
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search tenant…" className="h-8 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                }
              />
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Tenant","Requested By","Plan","Status","Submitted","Updated"].map((h) => (
                      <th key={h} className="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((req) => {
                    const sm = STATUS_META[req.status];
                    const Icon = sm.icon;
                    return (
                      <tr key={req.id} onClick={() => setSelected(selected?.id === req.id ? null : req)} className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected?.id === req.id ? "bg-green-50" : ""}`}>
                        <td className="px-5 py-3.5">
                          <div className="flex items-center gap-2.5">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">{req.tenantName.charAt(0)}</div>
                            <div>
                              <p className="font-semibold text-slate-900">{req.tenantName}</p>
                              <p className="text-[11px] text-slate-400">{req.slug}.nutratenant.com</p>
                            </div>
                          </div>
                        </td>
                        <td className="px-5 py-3.5 text-slate-600">{req.requestedBy}</td>
                        <td className="px-5 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${PLAN_BADGE[req.plan]}`}>{req.plan}</span></td>
                        <td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-semibold ${sm.badge}`}><Icon className="h-3 w-3" strokeWidth={2} />{req.status}</span></td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">{req.submittedAt}</td>
                        <td className="px-5 py-3.5 text-xs text-slate-500">{req.updatedAt}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-400">Showing {filtered.length} of {MOCK_REQUESTS.length} requests</p>
            </div>
          </div>

          {/* Detail panel */}
          {selected && (
            <DetailPanel
              title={selected.tenantName}
              badge={<span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_META[selected.status].badge}`}>{selected.status}</span>}
              onClose={() => setSelected(null)}
              footer={
                <div className="flex gap-2">
                  {selected.status !== "Completed" && (
                    <button type="button" className="flex-1 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700">
                      {selected.status === "In Progress" ? "Mark In Review" : "Approve & Complete"}
                    </button>
                  )}
                  {selected.status === "In Review" && (
                    <button type="button" className="rounded-lg border border-red-200 px-3 py-2 text-xs font-semibold text-red-600 hover:bg-red-50">Reject</button>
                  )}
                </div>
              }
            >
              <DetailRow icon={Tag}      label="Tenant Name"  value={selected.tenantName}   />
              <DetailRow icon={Globe}    label="Domain"       value={selected.domain}        />
              <DetailRow icon={User}     label="Requested By" value={selected.requestedBy}   />
              <DetailRow icon={Tag}      label="Plan"         value={selected.plan}          />
              <DetailRow icon={Calendar} label="Submitted"    value={selected.submittedAt}   />
              <DetailRow icon={FileText} label="Description"  value={selected.description}   />
              <DetailRow
                icon={User}
                label="Admin User"
                value={
                  <div className="flex items-center gap-2 mt-0.5">
                    <div className="flex h-7 w-7 items-center justify-center rounded-full bg-violet-100 text-xs font-bold text-violet-700">{selected.requestedBy.charAt(0)}</div>
                    <p className="text-xs text-slate-600">{selected.adminEmail}</p>
                  </div>
                }
              />
            </DetailPanel>
          )}
        </div>

        <AdminFooter />
      </div>
    </PlatformAdminShell>
  );
}
