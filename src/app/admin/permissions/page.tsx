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
} from "@/components/platform-admin/ui";
import { Calendar, ChevronDown, ChevronRight, KeyRound, Layers, Link2, Plus, Search, Shield } from "lucide-react";

type ActionType = "READ" | "WRITE" | "UPDATE" | "DELETE" | "LOGIN" | "MANAGE" | "EXPORT" | "SYNC";
type PermStatus = "Active" | "Inactive";

interface Permission {
  id: string; name: string; module: string; action: ActionType;
  resource: string; description: string; status: PermStatus;
  roles: string[]; createdAt: string;
}

const MOCK_PERMISSIONS: Permission[] = [
  // IAM Management (4)
  { id:"p1",  name:"Read Users",              module:"IAM Management",     action:"READ",   resource:"users",       description:"Read user records, profiles, and membership data.",                  status:"Active",   roles:["Super Admin","Tenant Admin","Moderator","Support Agent"],                   createdAt:"Jan 1, 2024" },
  { id:"p2",  name:"Create Users",            module:"IAM Management",     action:"WRITE",  resource:"users",       description:"Create new user accounts within a tenant.",                          status:"Active",   roles:["Super Admin","Tenant Admin"],                                               createdAt:"Jan 1, 2024" },
  { id:"p3",  name:"Update Users",            module:"IAM Management",     action:"UPDATE", resource:"users",       description:"Modify existing user attributes, roles, and status.",                status:"Active",   roles:["Super Admin","Tenant Admin"],                                               createdAt:"Jan 1, 2024" },
  { id:"p4",  name:"Delete Users",            module:"IAM Management",     action:"DELETE", resource:"users",       description:"Permanently remove user accounts.",                                  status:"Active",   roles:["Super Admin","Tenant Admin"],                                               createdAt:"Jan 1, 2024" },
  // Policy Management (4)
  { id:"p5",  name:"Read Policies",           module:"Policy Management",  action:"READ",   resource:"policies",    description:"View ABAC policy definitions and rule sets.",                        status:"Active",   roles:["Super Admin","Tenant Admin","Moderator"],                                   createdAt:"Jan 1, 2024" },
  { id:"p6",  name:"Create Policies",         module:"Policy Management",  action:"WRITE",  resource:"policies",    description:"Author and publish new access control policies.",                    status:"Active",   roles:["Super Admin","Tenant Admin"],                                               createdAt:"Jan 1, 2024" },
  { id:"p7",  name:"Update Policies",         module:"Policy Management",  action:"UPDATE", resource:"policies",    description:"Modify existing policy conditions and effects.",                     status:"Active",   roles:["Super Admin","Tenant Admin"],                                               createdAt:"Jan 1, 2024" },
  { id:"p8",  name:"Delete Policies",         module:"Policy Management",  action:"DELETE", resource:"policies",    description:"Remove policies from the active policy set.",                        status:"Active",   roles:["Super Admin"],                                                             createdAt:"Jan 1, 2024" },
  // Audit & Compliance (2)
  { id:"p9",  name:"Read Audit Logs",         module:"Audit & Compliance", action:"READ",   resource:"audit_logs",  description:"Access the immutable platform audit trail.",                        status:"Active",   roles:["Super Admin","Tenant Admin"],                                               createdAt:"Jan 1, 2024" },
  { id:"p10", name:"Export Compliance Report",module:"Audit & Compliance", action:"EXPORT", resource:"audit_logs",  description:"Generate and download compliance export packages.",                  status:"Active",   roles:["Super Admin","Finance Owner"],                                             createdAt:"Mar 1, 2024" },
  // Document Access (4)
  { id:"p11", name:"Read Documents",          module:"Document Access",    action:"READ",   resource:"documents",   description:"View documents and files within the tenant workspace.",              status:"Active",   roles:["Super Admin","Tenant Admin","Moderator","Member","User","Finance Owner"],   createdAt:"Jan 1, 2024" },
  { id:"p12", name:"Create Documents",        module:"Document Access",    action:"WRITE",  resource:"documents",   description:"Upload and publish new documents.",                                  status:"Active",   roles:["Super Admin","Tenant Admin","Moderator","Member"],                         createdAt:"Jan 1, 2024" },
  { id:"p13", name:"Update Documents",        module:"Document Access",    action:"UPDATE", resource:"documents",   description:"Edit and revise existing document content.",                         status:"Active",   roles:["Super Admin","Tenant Admin","Moderator"],                                   createdAt:"Jan 1, 2024" },
  { id:"p14", name:"Delete Documents",        module:"Document Access",    action:"DELETE", resource:"documents",   description:"Remove documents from the tenant workspace.",                        status:"Active",   roles:["Super Admin","Tenant Admin"],                                               createdAt:"Jan 1, 2024" },
  // Session & Auth (1)
  { id:"p15", name:"User Login",              module:"Session & Auth",     action:"LOGIN",  resource:"session",     description:"Authenticate and initiate a user session.",                         status:"Active",   roles:["Super Admin","Tenant Admin","Moderator","Member","User","Finance Owner","Support Agent"], createdAt:"Jan 1, 2024" },
  // Tenant Management (5)
  { id:"p16", name:"Read Tenants",            module:"Tenant Management",  action:"READ",   resource:"tenants",     description:"View tenant records and configuration.",                             status:"Active",   roles:["Super Admin"],                                                             createdAt:"Jan 1, 2024" },
  { id:"p17", name:"Create Tenants",          module:"Tenant Management",  action:"WRITE",  resource:"tenants",     description:"Provision new tenant workspaces.",                                   status:"Active",   roles:["Super Admin"],                                                             createdAt:"Jan 1, 2024" },
  { id:"p18", name:"Update Tenants",          module:"Tenant Management",  action:"UPDATE", resource:"tenants",     description:"Modify tenant settings, plan, and subdomain.",                      status:"Active",   roles:["Super Admin"],                                                             createdAt:"Jan 1, 2024" },
  { id:"p19", name:"Suspend Tenant",          module:"Tenant Management",  action:"MANAGE", resource:"tenants",     description:"Temporarily suspend a tenant workspace.",                           status:"Active",   roles:["Super Admin"],                                                             createdAt:"Feb 1, 2024" },
  { id:"p20", name:"Delete Tenants",          module:"Tenant Management",  action:"DELETE", resource:"tenants",     description:"Permanently remove a tenant and all associated data.",              status:"Active",   roles:["Super Admin"],                                                             createdAt:"Jan 1, 2024" },
  // Provisioning (4)
  { id:"p21", name:"Read Provisioning Jobs",  module:"Provisioning",       action:"READ",   resource:"provisioning",description:"View tenant provisioning queue and job status.",                    status:"Active",   roles:["Super Admin","Tenant Admin"],                                               createdAt:"Jan 1, 2024" },
  { id:"p22", name:"Trigger Provisioning",    module:"Provisioning",       action:"WRITE",  resource:"provisioning",description:"Initiate and approve provisioning workflows.",                      status:"Active",   roles:["Super Admin"],                                                             createdAt:"Jan 1, 2024" },
  { id:"p23", name:"Cancel Provisioning",     module:"Provisioning",       action:"MANAGE", resource:"provisioning",description:"Abort in-progress provisioning jobs.",                             status:"Active",   roles:["Super Admin"],                                                             createdAt:"Feb 1, 2024" },
  { id:"p24", name:"SCIM Sync",               module:"Provisioning",       action:"SYNC",   resource:"provisioning",description:"Trigger SCIM user/group synchronisation.",                        status:"Inactive", roles:["Super Admin"],                                                             createdAt:"Jun 1, 2024" },
  // Billing (4)
  { id:"p25", name:"Read Billing",            module:"Billing",            action:"READ",   resource:"billing",     description:"View subscription plans, invoices, and payment history.",           status:"Active",   roles:["Super Admin","Finance Owner"],                                             createdAt:"Jan 1, 2024" },
  { id:"p26", name:"Manage Subscriptions",    module:"Billing",            action:"MANAGE", resource:"billing",     description:"Modify plans, apply coupons, and update billing cycles.",           status:"Active",   roles:["Super Admin"],                                                             createdAt:"Jan 1, 2024" },
  { id:"p27", name:"Issue Refund",            module:"Billing",            action:"MANAGE", resource:"billing",     description:"Initiate refunds or credits on tenant accounts.",                   status:"Active",   roles:["Super Admin","Finance Owner"],                                             createdAt:"Mar 1, 2024" },
  { id:"p28", name:"Export Invoices",         module:"Billing",            action:"EXPORT", resource:"billing",     description:"Download invoice history as CSV or PDF.",                           status:"Active",   roles:["Super Admin","Finance Owner"],                                             createdAt:"Mar 1, 2024" },
  // Security (4)
  { id:"p29", name:"Read MFA Policies",       module:"Security",           action:"READ",   resource:"security",    description:"View MFA policy configurations across tenants.",                    status:"Active",   roles:["Super Admin","Tenant Admin"],                                               createdAt:"Jan 1, 2024" },
  { id:"p30", name:"Manage MFA Policies",     module:"Security",           action:"MANAGE", resource:"security",    description:"Create, update, and disable MFA enforcement policies.",             status:"Active",   roles:["Super Admin","Tenant Admin"],                                               createdAt:"Jan 1, 2024" },
  { id:"p31", name:"Manage IP Allowlist",     module:"Security",           action:"MANAGE", resource:"security",    description:"Configure allowed IP ranges for tenant access.",                    status:"Active",   roles:["Super Admin","Tenant Admin"],                                               createdAt:"Feb 1, 2024" },
  { id:"p32", name:"Manage Session Policy",   module:"Security",           action:"MANAGE", resource:"security",    description:"Configure session timeouts and concurrent session limits.",         status:"Inactive", roles:["Super Admin"],                                                             createdAt:"Jun 1, 2024" },
];

const ACTION_BADGE: Record<ActionType, string> = {
  READ:"bg-blue-50 text-blue-700", WRITE:"bg-emerald-50 text-emerald-700", UPDATE:"bg-amber-50 text-amber-700",
  DELETE:"bg-red-50 text-red-700", LOGIN:"bg-violet-50 text-violet-700",   MANAGE:"bg-orange-50 text-orange-700",
  EXPORT:"bg-cyan-50 text-cyan-700", SYNC:"bg-slate-100 text-slate-600",
};
const STATUS_COLORS: Record<string, string> = { Active:"bg-emerald-50 text-emerald-700", Inactive:"bg-gray-100 text-gray-500" };
const MODULES = ["All","IAM Management","Policy Management","Audit & Compliance","Document Access","Session & Auth","Tenant Management","Provisioning","Billing","Security"];

export default function PermissionsPage() {
  const [selected,     setSelected]     = useState<Permission | null>(null);
  const [search,       setSearch]       = useState("");
  const [moduleFilter, setModuleFilter] = useState("All");
  const [statusFilter, setStatusFilter] = useState("All");
  const [expanded,     setExpanded]     = useState<Set<string>>(new Set(MODULES.slice(1)));

  const filtered = MOCK_PERMISSIONS.filter((p) => {
    const ms  = !search || p.name.toLowerCase().includes(search.toLowerCase()) || p.resource.toLowerCase().includes(search.toLowerCase());
    const mm  = moduleFilter === "All" || p.module === moduleFilter;
    const mst = statusFilter === "All" || p.status === statusFilter;
    return ms && mm && mst;
  });

  const byModule = filtered.reduce<Record<string, Permission[]>>((acc, p) => {
    (acc[p.module] ??= []).push(p);
    return acc;
  }, {});

  const activeCount = MOCK_PERMISSIONS.filter((p) => p.status === "Active").length;

  const toggleModule = (mod: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      next.has(mod) ? next.delete(mod) : next.add(mod);
      return next;
    });
  };

  return (
    <PlatformAdminShell adminEmail="admin@nutratenant.com" adminId="preview">
      <div className="flex flex-col gap-6">
        <PreviewBanner showIcon>Preview mode — Permissions registry. Auth gate disabled for local dev.</PreviewBanner>

        <PageHeader
          title="Permissions"
          subtitle="All granular permissions grouped by module. These are the building blocks of ABAC roles and policies."
          actions={
            <button type="button" className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-700">
              <Plus className="h-4 w-4" /> Add Permission
            </button>
          }
        />

        <StatGrid cols={4}>
          <StatCard icon={KeyRound} value={MOCK_PERMISSIONS.length} label="Total Permissions" sub="All modules"          bg="bg-violet-50"  color="text-violet-600"  />
          <StatCard icon={Shield}   value={activeCount}              label="Active"            sub="Currently enforced"  bg="bg-emerald-50" color="text-emerald-600" />
          <StatCard icon={Layers}   value={8}                        label="Modules"           sub="Permission groups"   bg="bg-blue-50"    color="text-blue-600"    />
          <StatCard icon={Link2}    value={12}                       label="Linked Policies"   sub="ABAC policy links"   bg="bg-amber-50"   color="text-amber-600"   />
        </StatGrid>

        <div className="flex gap-6">
          <div className={`flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-all ${selected ? "flex-1" : "w-full"}`}>
            <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-5 py-3.5">
              <p className="text-sm font-semibold text-slate-900">Permission Registry</p>
              <SearchFilterBar
                searchSlot={
                  <div className="relative">
                    <Search className="pointer-events-none absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-400" />
                    <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search permissions…" className="h-8 rounded-lg border border-slate-200 bg-slate-50 pl-8 pr-3 text-xs placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-green-500" />
                  </div>
                }
              >
                <select value={moduleFilter} onChange={(e) => setModuleFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {MODULES.map((m) => <option key={m}>{m}</option>)}
                </select>
                <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="h-8 rounded-lg border border-slate-200 bg-white px-2.5 text-xs text-slate-600 focus:outline-none focus:ring-2 focus:ring-green-500">
                  {["All","Active","Inactive"].map((s) => <option key={s}>{s}</option>)}
                </select>
              </SearchFilterBar>
            </div>

            <div className="overflow-x-auto">
              {Object.entries(byModule).map(([mod, perms]) => (
                <div key={mod}>
                  <button type="button" onClick={() => toggleModule(mod)} className="flex w-full items-center gap-2 border-b border-slate-100 bg-slate-50 px-5 py-2.5 text-left hover:bg-slate-100">
                    {expanded.has(mod) ? <ChevronDown className="h-3.5 w-3.5 text-slate-400" /> : <ChevronRight className="h-3.5 w-3.5 text-slate-400" />}
                    <span className="text-xs font-semibold text-slate-700">{mod}</span>
                    <span className="ml-1 rounded-full bg-slate-200 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{perms.length}</span>
                  </button>
                  {expanded.has(mod) && (
                    <table className="w-full text-sm">
                      <tbody className="divide-y divide-slate-100">
                        {perms.map((perm) => (
                          <tr key={perm.id} onClick={() => setSelected(selected?.id === perm.id ? null : perm)} className={`cursor-pointer transition-colors hover:bg-slate-50 ${selected?.id === perm.id ? "bg-green-50" : ""}`}>
                            <td className="pl-10 pr-5 py-3">
                              <p className="font-medium text-slate-900">{perm.name}</p>
                              <p className="text-[11px] text-slate-400">{perm.description}</p>
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <span className="font-mono text-[10px] text-slate-500">{perm.resource}</span>
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTION_BADGE[perm.action]}`}>{perm.action}</span>
                            </td>
                            <td className="px-5 py-3 whitespace-nowrap">
                              <StatusBadge status={perm.status} colorMap={STATUS_COLORS} />
                            </td>
                            <td className="px-5 py-3">
                              <div className="flex flex-wrap gap-1 max-w-[200px]">
                                {perm.roles.slice(0, 2).map((r) => <span key={r} className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">{r}</span>)}
                                {perm.roles.length > 2 && <span className="rounded-full bg-slate-100 px-1.5 py-0.5 text-[10px] font-medium text-slate-600">+{perm.roles.length - 2}</span>}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              ))}
              {Object.keys(byModule).length === 0 && (
                <div className="py-10 text-center text-sm text-slate-400">No permissions match your filters.</div>
              )}
            </div>
            <div className="border-t border-slate-100 px-5 py-3">
              <p className="text-xs text-slate-400">Showing {filtered.length} of {MOCK_PERMISSIONS.length} permissions</p>
            </div>
          </div>

          {selected && (
            <DetailPanel
              title={selected.name}
              badge={<span className={`inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold ${ACTION_BADGE[selected.action]}`}>{selected.action}</span>}
              onClose={() => setSelected(null)}
              footer={
                <button type="button" className="w-full rounded-lg bg-green-600 py-2 text-xs font-semibold text-white hover:bg-green-700">Edit Permission</button>
              }
            >
              <p className="text-xs text-slate-500">{selected.description}</p>
              <DetailRow icon={Layers}   label="Module"    value={selected.module}       />
              <DetailRow icon={KeyRound} label="Resource"  value={<span className="font-mono text-xs">{selected.resource}</span>} />
              <DetailRow icon={Calendar} label="Created"   value={selected.createdAt}    />
              <StatusBadge status={selected.status} colorMap={STATUS_COLORS} />
              <div className="mt-4">
                <p className="mb-2 text-[10px] font-semibold uppercase tracking-wide text-slate-400">Roles with this permission ({selected.roles.length})</p>
                <div className="flex flex-wrap gap-1.5">
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
