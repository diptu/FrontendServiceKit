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
import { Building2, Calendar, CheckCircle2, Edit2, Gavel, Plus, Search, Shield, Trash2, XCircle, Zap } from "lucide-react";

type PolicyStatus  = "Active" | "Draft" | "In Review" | "Archived";
type PolicyEffect  = "ALLOW" | "DENY";

interface AbacCondition { attribute: string; operator: string; value: string }

interface AbacPolicy {
  id: string; name: string; description: string; tenant: string;
  resources: string[]; effect: PolicyEffect; status: PolicyStatus;
  conditions: AbacCondition[]; roles: string[]; createdAt: string; updatedAt: string;
}

const MOCK_POLICIES: AbacPolicy[] = [
  {
    id:"ab1", name:"Admin Full Access",          tenant:"All Tenants",     resources:["documents","users","policies"], effect:"ALLOW", status:"Active",    createdAt:"Jan 1, 2024",  updatedAt:"Jun 1, 2026",  roles:["Super Admin"],
    description:"Grants Super Admin unrestricted CRUD access to all resources.",
    conditions:[{ attribute:"role", operator:"eq", value:"Super Admin" },{ attribute:"clearance", operator:"gte", value:"4" }],
  },
  {
    id:"ab2", name:"Tenant Admin Workspace",      tenant:"All Tenants",     resources:["documents","users"],           effect:"ALLOW", status:"Active",    createdAt:"Jan 1, 2024",  updatedAt:"Jun 1, 2026",  roles:["Tenant Admin"],
    description:"Tenant admins can manage users and documents within their own tenant.",
    conditions:[{ attribute:"role", operator:"eq", value:"Tenant Admin" },{ attribute:"tenant_org", operator:"eq", value:"${subject.tenant}" }],
  },
  {
    id:"ab3", name:"Cross-Tenant Isolation",      tenant:"All Tenants",     resources:["*"],                           effect:"DENY",  status:"Active",    createdAt:"Jan 1, 2024",  updatedAt:"Jun 1, 2026",  roles:["All Roles"],
    description:"Prevents any principal from accessing resources belonging to a different tenant.",
    conditions:[{ attribute:"tenant_org", operator:"neq", value:"${resource.tenant}" }],
  },
  {
    id:"ab4", name:"Moderator Read Access",       tenant:"All Tenants",     resources:["documents","users"],           effect:"ALLOW", status:"Active",    createdAt:"Jan 1, 2024",  updatedAt:"May 1, 2026",  roles:["Moderator"],
    description:"Moderators can read documents and user profiles across their tenant.",
    conditions:[{ attribute:"role", operator:"eq", value:"Moderator" },{ attribute:"clearance", operator:"gte", value:"2" }],
  },
  {
    id:"ab5", name:"Member Document Write",       tenant:"All Tenants",     resources:["documents"],                   effect:"ALLOW", status:"Active",    createdAt:"Jan 1, 2024",  updatedAt:"May 1, 2026",  roles:["Member"],
    description:"Members can create and update documents if clearance >= 1.",
    conditions:[{ attribute:"role", operator:"eq", value:"Member" },{ attribute:"clearance", operator:"gte", value:"1" }],
  },
  {
    id:"ab6", name:"Finance Document Policy",     tenant:"Banana Republic", resources:["documents"],                   effect:"ALLOW", status:"Active",    createdAt:"Jul 10, 2024", updatedAt:"Jun 1, 2026",  roles:["Finance Owner","Tenant Admin"],
    description:"Finance team can read and write financial documents (clearance >= 3).",
    conditions:[{ attribute:"department", operator:"eq", value:"Finance" },{ attribute:"clearance", operator:"gte", value:"3" }],
  },
  {
    id:"ab7", name:"Audit Log Admin Policy",      tenant:"All Tenants",     resources:["audit_logs"],                  effect:"ALLOW", status:"Active",    createdAt:"Jan 1, 2024",  updatedAt:"Jun 1, 2026",  roles:["Super Admin","Tenant Admin"],
    description:"Admins can read the full audit trail. All other roles are implicitly denied.",
    conditions:[{ attribute:"role", operator:"in", value:"Super Admin,Tenant Admin" }],
  },
  {
    id:"ab8", name:"Executive Full Access",       tenant:"Apple Corp",      resources:["documents","users","policies"], effect:"ALLOW", status:"Active",    createdAt:"Apr 1, 2024",  updatedAt:"Jun 15, 2026", roles:["Executive Ops Lead"],
    description:"Apple Corp executives with clearance 5 get full read access across resources.",
    conditions:[{ attribute:"clearance", operator:"eq", value:"5" },{ attribute:"tenant_org", operator:"eq", value:"apple_corp" }],
  },
  {
    id:"ab9", name:"IT Security Audit Policy",    tenant:"Apple Corp",      resources:["audit_logs","policies"],       effect:"ALLOW", status:"In Review",  createdAt:"Jun 1, 2026",  updatedAt:"Jun 20, 2026", roles:["IT Security Officer"],
    description:"Under review: IT security officers requesting full audit + policy read access.",
    conditions:[{ attribute:"department", operator:"eq", value:"IT Security" },{ attribute:"clearance", operator:"gte", value:"3" }],
  },
  {
    id:"ab10",name:"Expired Session Deny",        tenant:"All Tenants",     resources:["*"],                           effect:"DENY",  status:"Active",    createdAt:"Jan 1, 2024",  updatedAt:"Jun 1, 2026",  roles:["All Roles"],
    description:"Denies all resource access when the session token is expired.",
    conditions:[{ attribute:"is_claims_expired", operator:"eq", value:"true" }],
  },
  {
    id:"ab11",name:"User Self-Service Policy",    tenant:"All Tenants",     resources:["documents"],                   effect:"ALLOW", status:"Draft",     createdAt:"Jun 15, 2026", updatedAt:"Jun 22, 2026", roles:["User"],
    description:"Draft: allow base-level users to read their own documents only.",
    conditions:[{ attribute:"role", operator:"eq", value:"User" },{ attribute:"clearance", operator:"gte", value:"1" }],
  },
  {
    id:"ab12",name:"Locked Account Deny",         tenant:"All Tenants",     resources:["*"],                           effect:"DENY",  status:"Active",    createdAt:"Jan 1, 2024",  updatedAt:"Jun 1, 2026",  roles:["All Roles"],
    description:"Deny all access for any account with account_locked = true.",
    conditions:[{ attribute:"account_locked", operator:"eq", value:"true" }],
  },
];

const STATUS_COLORS: Record<string, string> = { Active:"bg-emerald-50 text-emerald-700", Draft:"bg-gray-100 text-gray-600", "In Review":"bg-amber-50 text-amber-700", Archived:"bg-red-50 text-red-700" };
const EFFECT_BADGE: Record<PolicyEffect, string> = { ALLOW:"bg-emerald-50 text-emerald-700", DENY:"bg-red-50 text-red-700" };
const RESOURCE_BADGE: Record<string, string> = { documents:"bg-blue-50 text-blue-700", users:"bg-violet-50 text-violet-700", policies:"bg-amber-50 text-amber-700", audit_logs:"bg-orange-50 text-orange-700", "*":"bg-slate-100 text-slate-600", provisioning:"bg-cyan-50 text-cyan-700", billing:"bg-emerald-50 text-emerald-700", security:"bg-red-50 text-red-700" };

const TABS    = ["All","Active","In Review","Draft"] as const;
type Tab = typeof TABS[number];
const TENANTS = ["All Tenants","Apple Corp","Orange Teck","Banana Republic"];
const EFFECTS = ["All","ALLOW","DENY"];

const ROLES_OPTIONS  = ["Admin","Super Admin","Tenant Admin","Moderator","Member","Finance Owner","User","Support Agent"] as const;
const RESOURCE_OPTIONS = ["documents","users","policies","audit_logs","session","tenants","*"] as const;

type TestResult = { verdict: "ALLOW" | "DENY"; reason: string } | null;

export default function PoliciesPage() {
  const [selected,     setSelected]     = useState<AbacPolicy | null>(null);
  const [activeTab,    setActiveTab]    = useState<Tab>("All");
  const [search,       setSearch]       = useState("");
  const [tenantFilter, setTenantFilter] = useState("All Tenants");
  const [effectFilter, setEffectFilter] = useState("All");

  // Policy Test Console state
  const [testRole,     setTestRole]     = useState("Admin");
  const [testTenant,   setTestTenant]   = useState("apple_corp");
  const [testAction,   setTestAction]   = useState("READ");
  const [testResource, setTestResource] = useState("documents");
  const [testClearance,setTestClearance]= useState("3");
  const [testResult,   setTestResult]   = useState<TestResult>(null);

  const counts: Record<Tab, number> = {
    All:       MOCK_POLICIES.length,
    Active:    MOCK_POLICIES.filter((p) => p.status === "Active").length,
    "In Review":MOCK_POLICIES.filter((p) => p.status === "In Review").length,
    Draft:     MOCK_POLICIES.filter((p) => p.status === "Draft").length,
  };

  const filtered = MOCK_POLICIES.filter((p) => {
    const ms  = !search || p.name.toLowerCase().includes(search.toLowerCase());
    const mt  = tenantFilter === "All Tenants" || p.tenant === tenantFilter;
    const me  = effectFilter === "All" || p.effect === effectFilter;
    const ms2 = activeTab   === "All" || p.status === activeTab;
    return ms && mt && me && ms2;
  });

  const runPolicyTest = () => {
    const cl = parseInt(testClearance, 10) || 0;
    const deniers = MOCK_POLICIES.filter((p) => p.effect === "DENY" && p.status === "Active");
    const denied = deniers.find((p) => {
      if (p.name === "Cross-Tenant Isolation" && testTenant !== "apple_corp" && testAction === "DELETE") return true;
      if (p.name === "Locked Account Deny") return false;
      if (p.name === "Expired Session Deny") return false;
      return false;
    });
    if (denied) { setTestResult({ verdict:"DENY", reason:`Policy "${denied.name}" explicitly denies this request.` }); return; }

    const allowers = MOCK_POLICIES.filter((p) => p.effect === "ALLOW" && p.status === "Active");
    const allowed = allowers.find((p) => {
      const resourceMatch = p.resources.includes(testResource) || p.resources.includes("*");
      if (!resourceMatch) return false;
      const hasRole = p.roles.some((r) => r.toLowerCase() === testRole.toLowerCase() || r === "All Roles");
      if (!hasRole && !p.roles.includes("All Roles") && p.conditions.every((c) => c.attribute !== "role")) return false;
      const clReq = p.conditions.find((c) => c.attribute === "clearance");
      if (clReq) {
        const reqCl = parseInt(clReq.value, 10);
        if (clReq.operator === "gte" && cl < reqCl) return false;
        if (clReq.operator === "eq"  && cl !== reqCl) return false;
      }
      return true;
    });

    if (allowed) { setTestResult({ verdict:"ALLOW", reason:`Policy "${allowed.name}" grants ${testRole} ${testAction} on ${testResource}.` }); }
    else         { setTestResult({ verdict:"DENY",  reason:`No active ALLOW policy covers ${testRole} performing ${testAction} on ${testResource} with clearance ${testClearance}.` }); }
  };

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId="preview">
      <div className="flex flex-col gap-6">
        <PreviewBanner showIcon>Preview mode — ABAC Policy management. Auth gate disabled for local dev.</PreviewBanner>

        <PageHeader
          title="Policies (ABAC)"
          subtitle="Define attribute-based access control rules that govern every resource access decision."
          actions={
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
              <Plus className="h-4 w-4" /> Create Policy
            </button>
          }
        />

        <StatGrid cols={5}>
          <StatCard icon={Gavel}  value={MOCK_POLICIES.length}    label="Total Policies" sub="All states"           bg="bg-violet-50"  color="text-violet-600"  />
          <StatCard icon={Shield} value={counts.Active}            label="Active"         sub="Enforced"             bg="bg-emerald-50" color="text-emerald-600" />
          <StatCard icon={Zap}    value={MOCK_POLICIES.filter((p) => p.effect === "DENY" && p.status === "Active").length} label="Strict Deny" sub="Hard deny rules" bg="bg-red-50" color="text-red-600" />
          <StatCard icon={Shield} value={counts["In Review"]}      label="In Review"      sub="Pending approval"     bg="bg-amber-50"   color="text-amber-600"   />
          <StatCard icon={Edit2}  value={counts.Draft}             label="Draft"          sub="Not yet published"    bg="bg-gray-100"   color="text-gray-500"    />
        </StatGrid>

        <div className="flex gap-6">
          {/* Policies table */}
          <div className={`flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all ${selected ? "flex-1" : "w-full"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
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
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search policies…" className="h-8 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                }
              >
                <select value={tenantFilter} onChange={(e) => setTenantFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {TENANTS.map((t) => <option key={t}>{t}</option>)}
                </select>
                <select value={effectFilter} onChange={(e) => setEffectFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {EFFECTS.map((e) => <option key={e}>{e}</option>)}
                </select>
              </SearchFilterBar>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-100 bg-slate-50">
                    {["Policy Name","Resources","Effect","Status","Conditions","Tenant","Actions"].map((h) => (
                      <th key={h} className="whitespace-nowrap px-5 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((pol) => (
                    <tr key={pol.id} onClick={() => setSelected(selected?.id === pol.id ? null : pol)} className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected?.id === pol.id ? "bg-green-50" : ""}`}>
                      <td className="px-5 py-3.5">
                        <div className="flex items-center gap-2.5">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-green-100"><Gavel className="h-4 w-4 text-green-700" /></div>
                          <div>
                            <p className="font-semibold text-slate-900">{pol.name}</p>
                            <p className="text-[11px] text-slate-400 line-clamp-1 max-w-[180px]">{pol.description}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3.5">
                        <div className="flex flex-wrap gap-1 max-w-[160px]">
                          {pol.resources.map((r) => <span key={r} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${RESOURCE_BADGE[r] ?? "bg-slate-100 text-slate-600"}`}>{r}</span>)}
                        </div>
                      </td>
                      <td className="px-5 py-3.5"><span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${EFFECT_BADGE[pol.effect]}`}>{pol.effect === "ALLOW" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{pol.effect}</span></td>
                      <td className="px-5 py-3.5"><StatusBadge status={pol.status} colorMap={STATUS_COLORS} /></td>
                      <td className="px-5 py-3.5"><span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{pol.conditions.length} rule{pol.conditions.length !== 1 ? "s" : ""}</span></td>
                      <td className="px-5 py-3.5 text-xs text-slate-600">{pol.tenant}</td>
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

          {/* Right panel: detail or test console */}
          {!selected ? (
            <div className="flex w-80 shrink-0 flex-col rounded-xl border border-slate-200 bg-white shadow-sm">
              <div className="border-b border-slate-100 px-4 py-3.5">
                <div className="flex items-center gap-2">
                  <Zap className="h-4 w-4 text-green-600" />
                  <h3 className="text-sm font-semibold text-slate-900">Policy Test Console</h3>
                </div>
                <p className="mt-0.5 text-[11px] text-slate-400">Simulate an access check against active policies.</p>
              </div>
              <div className="flex flex-col gap-3 overflow-y-auto p-4">
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Subject Role</label>
                  <select value={testRole} onChange={(e) => { setTestRole(e.target.value); setTestResult(null); }} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                    {ROLES_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Tenant</label>
                  <select value={testTenant} onChange={(e) => { setTestTenant(e.target.value); setTestResult(null); }} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                    <option value="apple_corp">Apple Corp</option>
                    <option value="orange_teck">Orange Teck</option>
                    <option value="banana_republic">Banana Republic</option>
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Action</label>
                  <select value={testAction} onChange={(e) => { setTestAction(e.target.value); setTestResult(null); }} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                    {["READ","WRITE","UPDATE","DELETE","MANAGE","LOGIN","EXPORT"].map((a) => <option key={a}>{a}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Resource Type</label>
                  <select value={testResource} onChange={(e) => { setTestResource(e.target.value); setTestResult(null); }} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500">
                    {RESOURCE_OPTIONS.map((r) => <option key={r}>{r}</option>)}
                  </select>
                </div>
                <div>
                  <label className="mb-1 block text-[10px] font-semibold uppercase tracking-wide text-slate-400">Clearance Level (1–5)</label>
                  <input type="number" min={1} max={5} value={testClearance} onChange={(e) => { setTestClearance(e.target.value); setTestResult(null); }} className="w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs text-slate-700 focus:outline-none focus:ring-2 focus:ring-green-500" />
                </div>
                <button type="button" onClick={runPolicyTest} className="w-full rounded-lg bg-green-600 py-2.5 text-xs font-semibold text-white hover:bg-green-700">
                  Run Test
                </button>
                {testResult && (
                  <div className={`rounded-lg border px-3 py-3 ${testResult.verdict === "ALLOW" ? "border-emerald-200 bg-emerald-50" : "border-red-200 bg-red-50"}`}>
                    <div className={`flex items-center gap-2 font-bold text-sm ${testResult.verdict === "ALLOW" ? "text-emerald-700" : "text-red-700"}`}>
                      {testResult.verdict === "ALLOW" ? <CheckCircle2 className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                      {testResult.verdict}
                    </div>
                    <p className={`mt-1.5 text-[11px] ${testResult.verdict === "ALLOW" ? "text-emerald-600" : "text-red-600"}`}>{testResult.reason}</p>
                  </div>
                )}
              </div>
            </div>
          ) : (
            <DetailPanel
              title={selected.name}
              badge={<span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${EFFECT_BADGE[selected.effect]}`}>{selected.effect === "ALLOW" ? <CheckCircle2 className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}{selected.effect}</span>}
              onClose={() => setSelected(null)}
              footer={
                <div className="flex gap-2">
                  <button type="button" className="flex-1 rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700">Edit Policy</button>
                  <button type="button" className="rounded-lg border border-slate-200 px-3 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50">Duplicate</button>
                </div>
              }
            >
              <p className="text-xs text-slate-500">{selected.description}</p>
              <DetailRow icon={Building2} label="Tenant"   value={selected.tenant}      />
              <DetailRow icon={Calendar}  label="Updated"  value={selected.updatedAt}   />
              <StatusBadge status={selected.status} colorMap={STATUS_COLORS} />
              <div className="mt-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Resources</p>
                <div className="flex flex-wrap gap-1">
                  {selected.resources.map((r) => <span key={r} className={`rounded-full px-2 py-0.5 text-[10px] font-semibold ${RESOURCE_BADGE[r] ?? "bg-slate-100 text-slate-600"}`}>{r}</span>)}
                </div>
              </div>
              <div className="mt-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Conditions ({selected.conditions.length})</p>
                <div className="flex flex-col gap-1.5">
                  {selected.conditions.map((c, i) => (
                    <div key={i} className="rounded-lg border border-slate-100 bg-slate-50 px-3 py-2 font-mono text-[10px] text-slate-700">
                      <span className="text-violet-600">{c.attribute}</span> <span className="text-slate-400">{c.operator}</span> <span className="text-emerald-600">{c.value}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="mt-3">
                <p className="mb-1.5 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Applies To</p>
                <div className="flex flex-wrap gap-1">
                  {selected.roles.map((r) => <span key={r} className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-600">{r}</span>)}
                </div>
              </div>
            </DetailPanel>
          )}
        </div>

        <AdminFooter />
      </div>
    </PlatformAdminShell>
  );
}
