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
import { Building2, Calendar, Edit2, Fingerprint, Plus, Search, Shield, ShieldCheck, Trash2, Users } from "lucide-react";

type PolicyStatus = "Active" | "Inactive" | "Disabled";
type PolicyType   = "Global" | "Conditional" | "Role-Based";
type MfaMethod    = "TOTP" | "SMS" | "Email" | "Hardware Key" | "TOTP + SMS";

interface MfaPolicy {
  id: string; name: string; tenant: string; status: PolicyStatus;
  policyType: PolicyType; mfaMethod: MfaMethod; appliesToRoles: string[];
  conditions: string; description: string; createdAt: string; updatedAt: string;
}

const MOCK_POLICIES: MfaPolicy[] = [
  { id:"mp1",  name:"Global Admin MFA",          tenant:"Apple Corp",       status:"Active",   policyType:"Global",      mfaMethod:"TOTP",            appliesToRoles:["Admin","Moderator"],                createdAt:"Mar 5, 2024",  updatedAt:"Jun 1, 2026",  conditions:"Enforced on every login, no exceptions.",                description:"Require MFA for all admin and moderator accounts on Apple Corp."          },
  { id:"mp2",  name:"Employee Security Policy",   tenant:"Orange Teck",      status:"Active",   policyType:"Conditional", mfaMethod:"TOTP + SMS",      appliesToRoles:["Admin","Moderator","Member"],        createdAt:"May 1, 2024",  updatedAt:"Jun 5, 2026",  conditions:"Required when logging in from a new device or location.",description:"Adaptive MFA triggered on login anomalies for Orange Teck employees."     },
  { id:"mp3",  name:"Finance Team MFA",           tenant:"Banana Republic",  status:"Active",   policyType:"Conditional", mfaMethod:"TOTP",            appliesToRoles:["Finance Owner","Admin"],             createdAt:"Jul 10, 2024", updatedAt:"Jun 10, 2026", conditions:"Required when accessing billing or finance documents.",   description:"MFA enforced for all finance-related document access within BR."          },
  { id:"mp4",  name:"Support Agent Policy",       tenant:"All Tenants",      status:"Active",   policyType:"Role-Based",  mfaMethod:"TOTP",            appliesToRoles:["Support Agent"],                    createdAt:"Jan 1, 2024",  updatedAt:"May 1, 2026",  conditions:"Enforced at first login of each support session.",       description:"Requires support agents to verify via TOTP at session start."             },
  { id:"mp5",  name:"High-Risk Access Policy",    tenant:"Apple Corp",       status:"Active",   policyType:"Conditional", mfaMethod:"Hardware Key",    appliesToRoles:["Admin","IT Security Officer"],      createdAt:"Apr 15, 2024", updatedAt:"Jun 15, 2026", conditions:"Triggered when accessing clearance-level 4 or 5 resources.",description:"Hardware key required for privileged access to high-clearance data."      },
  { id:"mp6",  name:"Legacy Migration Policy",    tenant:"Orange Teck",      status:"Inactive", policyType:"Global",      mfaMethod:"SMS",             appliesToRoles:["All Roles"],                        createdAt:"Feb 1, 2024",  updatedAt:"Mar 1, 2024",  conditions:"Deprecated — replaced by Employee Security Policy.",     description:"Legacy SMS-based MFA. Migrated to TOTP+SMS in Employee Security Policy."  },
  { id:"mp7",  name:"Executive Override Policy",  tenant:"Apple Corp",       status:"Active",   policyType:"Role-Based",  mfaMethod:"Hardware Key",    appliesToRoles:["Executive Ops Lead"],               createdAt:"Apr 1, 2024",  updatedAt:"Jun 20, 2026", conditions:"Always enforced; no bypass allowed.",                     description:"Non-negotiable hardware key MFA for executive leadership."               },
  { id:"mp8",  name:"New User Onboarding MFA",    tenant:"All Tenants",      status:"Active",   policyType:"Conditional", mfaMethod:"Email",           appliesToRoles:["User","Member"],                    createdAt:"Jan 1, 2024",  updatedAt:"Apr 1, 2026",  conditions:"Required on first login and device registration.",       description:"Email-based MFA challenge on account activation for new users."           },
  { id:"mp9",  name:"Banana Republic Staff MFA",  tenant:"Banana Republic",  status:"Active",   policyType:"Role-Based",  mfaMethod:"TOTP",            appliesToRoles:["Member","User"],                    createdAt:"Jul 15, 2024", updatedAt:"Jun 1, 2026",  conditions:"Enforced after 3 consecutive failed login attempts.",    description:"Triggered TOTP enforcement for BR staff after repeated login failures."   },
  { id:"mp10", name:"Cross-Tenant Admin Policy",  tenant:"All Tenants",      status:"Active",   policyType:"Global",      mfaMethod:"Hardware Key",    appliesToRoles:["Super Admin","Tenant Admin"],        createdAt:"Jan 1, 2024",  updatedAt:"Jun 20, 2026", conditions:"Enforced on all cross-tenant admin actions.",            description:"Platform-level hardware key policy for all admin-tier accounts."          },
  { id:"mp11", name:"Moderator Session Policy",   tenant:"Orange Teck",      status:"Disabled", policyType:"Role-Based",  mfaMethod:"TOTP",            appliesToRoles:["Moderator"],                        createdAt:"Jun 1, 2024",  updatedAt:"Jun 10, 2026", conditions:"Disabled pending policy review.",                        description:"Paused TOTP policy for Orange Teck moderators, under review."             },
];

const STATUS_COLORS: Record<string, string> = { Active:"bg-emerald-50 text-emerald-700", Inactive:"bg-gray-100 text-gray-500", Disabled:"bg-red-50 text-red-700" };
const TYPE_BADGE: Record<PolicyType, string> = { Global:"bg-violet-50 text-violet-700", Conditional:"bg-amber-50 text-amber-700", "Role-Based":"bg-blue-50 text-blue-700" };
const METHOD_BADGE: Record<MfaMethod, string>= { TOTP:"bg-emerald-50 text-emerald-700", SMS:"bg-blue-50 text-blue-700", Email:"bg-cyan-50 text-cyan-700", "Hardware Key":"bg-violet-50 text-violet-700", "TOTP + SMS":"bg-amber-50 text-amber-700" };
const TENANTS  = ["All Tenants","Apple Corp","Orange Teck","Banana Republic"];
const STATUSES = ["All","Active","Inactive","Disabled"] as const;
const TYPES    = ["All","Global","Conditional","Role-Based"];
const METHODS  = ["All","TOTP","SMS","Email","Hardware Key","TOTP + SMS"];

export default function MfaPoliciesPage() {
  const [selected,      setSelected]      = useState<MfaPolicy | null>(null);
  const [activeTab,     setActiveTab]     = useState("All");
  const [search,        setSearch]        = useState("");
  const [tenantFilter,  setTenantFilter]  = useState("All Tenants");
  const [typeFilter,    setTypeFilter]    = useState("All");
  const [methodFilter,  setMethodFilter]  = useState("All");

  const counts: Record<typeof STATUSES[number], number> = {
    All: MOCK_POLICIES.length,
    Active: MOCK_POLICIES.filter((p) => p.status === "Active").length,
    Inactive: MOCK_POLICIES.filter((p) => p.status === "Inactive").length,
    Disabled: MOCK_POLICIES.filter((p) => p.status === "Disabled").length,
  };

  const filtered = MOCK_POLICIES.filter((p) => {
    const ms  = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const mt  = tenantFilter === "All Tenants" || p.tenant === tenantFilter;
    const mty = typeFilter   === "All" || p.policyType === typeFilter;
    const mm  = methodFilter === "All" || p.mfaMethod === methodFilter;
    const ms2 = activeTab    === "All" || p.status === activeTab;
    return ms && mt && mty && mm && ms2;
  });

  const conditionalCount = MOCK_POLICIES.filter((p) => p.policyType === "Conditional").length;

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId="preview">
      <div className="flex flex-col gap-6">
        <PreviewBanner showIcon>Preview mode — MFA Policies management. Auth gate disabled for local dev.</PreviewBanner>

        <PageHeader
          title="MFA Policies"
          subtitle="Configure multi-factor authentication enforcement across tenants and roles."
          actions={
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
              <Plus className="h-4 w-4" /> Create Policy
            </button>
          }
        />

        <StatGrid cols={5}>
          <StatCard icon={Fingerprint} value={MOCK_POLICIES.length}  label="All Policies"  sub="Platform-wide"        bg="bg-violet-50"  color="text-violet-600"  />
          <StatCard icon={ShieldCheck} value={counts.Active}          label="Active"        sub="Currently enforcing"  bg="bg-emerald-50" color="text-emerald-600" />
          <StatCard icon={Shield}      value={conditionalCount}        label="Conditional"   sub="Context-triggered"    bg="bg-amber-50"   color="text-amber-600"   />
          <StatCard icon={Users}       value={counts.Inactive}         label="Inactive"      sub="Paused or migrated"   bg="bg-gray-100"   color="text-gray-500"    />
          <StatCard icon={Building2}   value={counts.Disabled}         label="Disabled"      sub="Under review"         bg="bg-red-50"     color="text-red-600"     />
        </StatGrid>

        <div className="flex gap-6">
          <div className={`flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all ${selected ? "flex-1" : "w-full"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
              <TabBar
                tabs={STATUSES.map((s) => ({ label: s, count: counts[s] }))}
                active={activeTab}
                onChange={setActiveTab}
                variant="underline"
              />
              <SearchFilterBar
                searchSlot={
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search policies…" className="h-8 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                }
              >
                <select value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {TENANTS.map((t) => <option key={t}>{t}</option>)}
                </select>
                <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {TYPES.map((t) => <option key={t}>{t}</option>)}
                </select>
                <select value={methodFilter} onChange={(e) => setMethodFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {METHODS.map((m) => <option key={m}>{m}</option>)}
                </select>
              </SearchFilterBar>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Policy Name","Tenant","Status","Type","MFA Method","Updated","Actions"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((pol) => (
                    <tr key={pol.id} onClick={() => setSelected(selected?.id === pol.id ? null : pol)} className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected?.id === pol.id ? "bg-green-50" : ""}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-violet-100 text-violet-700"><Fingerprint className="h-4 w-4" /></div>
                          <div>
                            <p className="font-semibold text-slate-900">{pol.name}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[180px]">{pol.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">{pol.tenant}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={pol.status} colorMap={STATUS_COLORS} /></td>
                      <td className="px-5 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${TYPE_BADGE[pol.policyType]}`}>{pol.policyType}</span></td>
                      <td className="px-5 py-3.5"><span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${METHOD_BADGE[pol.mfaMethod]}`}>{pol.mfaMethod}</span></td>
                      <td className="px-5 py-3.5 text-xs text-slate-500">{pol.updatedAt}</td>
                      <td className="px-5 py-3.5" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button type="button" className="rounded-md border border-slate-200 p-1.5 text-slate-400 hover:bg-slate-50"><Edit2 className="h-3.5 w-3.5" /></button>
                          <button type="button" className="rounded-md border border-red-200 p-1.5 text-red-400 hover:bg-red-50"><Trash2 className="h-3.5 w-3.5" /></button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-400">Showing {filtered.length} of {MOCK_POLICIES.length} policies</p>
            </div>
          </div>

          {selected && (
            <DetailPanel
              title={selected.name}
              badge={<span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${STATUS_COLORS[selected.status]}`}>{selected.status}</span>}
              onClose={() => setSelected(null)}
              footer={
                <div className="flex gap-2">
                  <button type="button" className="flex-1 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700">Edit Policy</button>
                  <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">
                    {selected.status === "Active" ? "Disable" : "Enable"}
                  </button>
                </div>
              }
            >
              <p className="text-xs text-slate-500">{selected.description}</p>
              <DetailRow icon={Building2}   label="Tenant"      value={selected.tenant}                                  />
              <DetailRow icon={Shield}      label="Type"        value={<span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${TYPE_BADGE[selected.policyType]}`}>{selected.policyType}</span>} />
              <DetailRow icon={Fingerprint} label="MFA Method"  value={<span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${METHOD_BADGE[selected.mfaMethod]}`}>{selected.mfaMethod}</span>} />
              <DetailRow icon={Calendar}    label="Created"     value={selected.createdAt}                               />
              <div className="mt-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Applies To</p>
                <div className="flex flex-wrap gap-1.5">
                  {selected.appliesToRoles.map((r) => <span key={r} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{r}</span>)}
                </div>
              </div>
              <div className="mt-3 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                <p className="mb-0.5 text-[10px] font-semibold uppercase tracking-wide text-amber-700">Conditions</p>
                <p className="text-xs text-amber-800">{selected.conditions}</p>
              </div>
            </DetailPanel>
          )}
        </div>

        <AdminFooter />
      </div>
    </PlatformAdminShell>
  );
}
